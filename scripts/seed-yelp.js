#!/usr/bin/env node
/**
 * seed-yelp.js
 * ─────────────────────────────────────────────────────────────
 * Crawls the Yelp Fusion API for businesses by zip code + category
 * and upserts them into the Firestore `helpers` collection.
 *
 * Usage:
 *   node scripts/seed-yelp.js
 *
 * Prerequisites:
 *   npm install firebase-admin node-fetch dotenv   (in project root)
 *
 * Environment variables (create a .env file or set in shell):
 *   YELP_API_KEY=<your Yelp Fusion API key>
 *   GOOGLE_APPLICATION_CREDENTIALS=<path to Firebase service account JSON>
 *     OR set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY inline.
 * ─────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env.seed', import.meta.url).pathname });
import fetch from 'node-fetch';
import admin from 'firebase-admin';

// ─── CONFIG ──────────────────────────────────────────────────
// ZIP codes to crawl
const ZIP_CODES = [
  '95391', // San Francisco, CA – Downtown / Civic Center
  '95336', // San Francisco, CA – SoMa
  '95388', // San Francisco, CA – Embarcadero / Financial District South
  '95366', // San Francisco, CA – Potrero Hill / Dogpatch
  '95337', // San Francisco, CA – Mission District
];

// Yelp category aliases → your app's category label
// Full list: https://www.yelp.com/developers/documentation/v3/all_category_list
const CATEGORY_MAP = {
  plumbing: 'Plumbing',
  electricians: 'Electricians',
  landscaping: 'Landscaping',
  housecleaning: 'Cleaning',
  painters: 'Painting',
  handyman: 'Handyman',
  movers: 'Moving',
  carpentry: 'Carpentry',
  hvac: 'HVAC',
  pestcontrol: 'Pest Control',
};

// Max results per (zip × category) — Yelp max is 50
const RESULTS_PER_QUERY = 20;

// Firestore collection name (matches HelperService.ts)
const COLLECTION = 'helpers';
// ─────────────────────────────────────────────────────────────

// ─── FIREBASE INIT ───────────────────────────────────────────
let app;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Service account file path provided
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} else if (process.env.FIREBASE_PRIVATE_KEY) {
  // Inline credentials
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
} else {
  console.error(
    '❌  No Firebase credentials found.\n' +
    '   Set GOOGLE_APPLICATION_CREDENTIALS=<path-to-service-account.json>\n' +
    '   or set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.'
  );
  process.exit(1);
}

const db = admin.firestore(app);
// ─────────────────────────────────────────────────────────────

// ─── YELP FETCH ──────────────────────────────────────────────
const YELP_API_KEY = process.env.YELP_API_KEY;
if (!YELP_API_KEY) {
  console.error('❌  YELP_API_KEY is not set.');
  process.exit(1);
}

async function fetchYelpBusinesses(zip, yelpCategory) {
  const url = new URL('https://api.yelp.com/v3/businesses/search');
  url.searchParams.set('location', zip);
  url.searchParams.set('categories', yelpCategory);
  url.searchParams.set('limit', String(RESULTS_PER_QUERY));
  url.searchParams.set('sort_by', 'rating');

  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${YELP_API_KEY}` },
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Yelp API error ${resp.status}: ${body}`);
  }

  const data = await resp.json();
  return data.businesses || [];
}
// ─────────────────────────────────────────────────────────────

// ─── MAP YELP → HELPER ───────────────────────────────────────
function mapToHelper(biz, appCategory, zip) {
  const location = biz.location || {};
  const addressParts = [
    location.address1,
    location.city,
    location.state,
    location.zip_code,
  ].filter(Boolean);

  return {
    // Core fields
    name: biz.name || '',
    title: biz.name || '',
    description: biz.categories?.map(c => c.title).join(', ') || appCategory,
    info: `${biz.review_count || 0} reviews on Yelp`,
    category: appCategory,
    tags: (biz.categories || []).map(c => c.alias),

    // Contact
    email: '',                          // Yelp doesn't expose email
    contact: biz.display_phone || biz.phone || '',
    website: biz.url || '',               // Yelp business page

    // Location — stored as array so searchHelpers() `array-contains` works
    zipcodes: Array.from(new Set([zip, location.zip_code].filter(Boolean))),
    address: addressParts.join(', '),

    // Ratings
    rating: biz.rating || 0,
    ratingCount: biz.review_count || 0,
    reviews: [],                          // Seed with empty; load real reviews separately

    // Media
    avatar: biz.image_url || '',
    banner: biz.image_url || '',

    // Metadata
    yelpId: biz.id,                      // Keep for dedup / future sync
    source: 'yelp',
    seededAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}
// ─────────────────────────────────────────────────────────────

// ─── UPSERT HELPERS ──────────────────────────────────────────
/**
 * We use the Yelp business ID as the dedup key stored in a `yelpId` field.
 * First pass: query for existing docs with that yelpId; update if found, else create.
 * Firestore doesn't support unique indexes so we batch-query first.
 */
async function upsertHelpers(helpers) {
  let added = 0;
  let updated = 0;

  // Chunk into batches of 30 (Firestore `in` limit)
  const batchSize = 30;
  for (let i = 0; i < helpers.length; i += batchSize) {
    const chunk = helpers.slice(i, i + batchSize);
    const yelpIds = chunk.map(h => h.yelpId);

    // Find existing docs
    const snapshot = await db
      .collection(COLLECTION)
      .where('yelpId', 'in', yelpIds)
      .get();

    const existingByYelpId = {};
    snapshot.forEach(doc => {
      existingByYelpId[doc.data().yelpId] = doc.id;
    });

    const batch = db.batch();
    for (const helper of chunk) {
      if (existingByYelpId[helper.yelpId]) {
        const ref = db.collection(COLLECTION).doc(existingByYelpId[helper.yelpId]);
        batch.update(ref, helper);
        updated++;
      } else {
        const ref = db.collection(COLLECTION).doc();
        batch.set(ref, helper);
        added++;
      }
    }
    await batch.commit();
  }

  return { added, updated };
}
// ─────────────────────────────────────────────────────────────

// ─── MAIN ────────────────────────────────────────────────────
async function main() {
  const allHelpers = [];
  const seenYelpIds = new Set();

  for (const zip of ZIP_CODES) {
    for (const [yelpCategory, appCategory] of Object.entries(CATEGORY_MAP)) {
      console.log(`🔍  Fetching: zip=${zip} category=${yelpCategory}`);
      try {
        const businesses = await fetchYelpBusinesses(zip, yelpCategory);
        console.log(`   → ${businesses.length} results`);

        for (const biz of businesses) {
          if (seenYelpIds.has(biz.id)) continue; // dedup across zip codes
          seenYelpIds.add(biz.id);
          allHelpers.push(mapToHelper(biz, appCategory, zip));
        }

        // Yelp rate limit: ~5 req/s on free tier — be polite
        await new Promise(r => setTimeout(r, 250));
      } catch (err) {
        console.error(`   ⚠️  ${err.message}`);
      }
    }
  }

  console.log(`\n📦  Total unique businesses collected: ${allHelpers.length}`);
  console.log('💾  Writing to Firestore...');

  const { added, updated } = await upsertHelpers(allHelpers);
  console.log(`✅  Done — ${added} added, ${updated} updated.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
