import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({maxInstances: 10});

const spaBase = "https://doitto-fdce8.web.app";

const BOT_AGENTS = [
  "facebookexternalhit", "facebookcatalog", "twitterbot", "whatsapp",
  "slackbot", "telegrambot", "linkedinbot", "discordbot", "applebot",
  "googlebot", "bingbot",
];

function isCrawler(ua: string): boolean {
  return BOT_AGENTS.some((b) => ua.toLowerCase().includes(b));
}

function escapeHtml(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Resolve a possibly-relative image path to a full https URL. Returns empty string if missing. */
function resolveImage(raw?: string): string {
  if (!raw || raw.trim() === "") return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `${spaBase}/${raw.replace(/^\.?\//, "")}`;
}

/** Simple in-memory cache: helperId → { data, cachedAt } */
const memCache = new Map<string, { data: HelperData; cachedAt: number }>();
const MEM_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface HelperData {
  name: string;
  category: string;
  description: string;
  rating: number;
  bannerUrl: string;
  avatarUrl: string;
}

async function getHelperData(helperId: string): Promise<HelperData | null> {
  const cached = memCache.get(helperId);
  if (cached && Date.now() - cached.cachedAt < MEM_CACHE_TTL_MS) {
    return cached.data;
  }

  const doc = await admin.firestore().collection("helpers").doc(helperId).get();
  if (!doc.exists) return null;

  const d = doc.data() as {
    name?: string; category?: string; description?: string;
    rating?: number; avatar?: string; banner?: string;
  };

  const data: HelperData = {
    name: d.name ?? "Helper",
    category: d.category ?? "",
    description: d.description ?? "",
    rating: d.rating ?? 0,
    bannerUrl: resolveImage(d.banner),
    avatarUrl: resolveImage(d.avatar),
  };

  memCache.set(helperId, {data, cachedAt: Date.now()});
  return data;
}

/**
 * GET /share/helper/:id
 *
 * Social bots: Returns OG HTML with the banner as og:image (JPG/PNG — fully
 * supported by all platforms), plus avatar URL as a secondary og:image so
 * platforms that support multiple images (LinkedIn etc.) can show it.
 *
 * Regular users: 302 redirect to the SPA profile page.
 */
export const shareHelper = onRequest(async (req, res) => {
  const parts = req.path.split("/").filter(Boolean);
  // path: /share/helper/:id → parts[2] = id
  const helperId = parts[2] ?? parts[parts.length - 1];
  const spaUrl = helperId ? `${spaBase}/helper-profile/${helperId}` : spaBase;

  if (!helperId) { res.redirect(302, spaBase); return; }

  // Regular users → SPA (no redirect loop — different path from /helper-profile/*)
  if (!isCrawler(req.headers["user-agent"] ?? "")) {
    res.redirect(302, spaUrl);
    return;
  }

  try {
    const helper = await getHelperData(helperId);
    if (!helper) { res.redirect(302, spaUrl); return; }

    const name = escapeHtml(helper.name);
    const category = escapeHtml(helper.category);
    const rating = helper.rating;
    const stars = "⭐".repeat(Math.round(rating));
    const desc = escapeHtml(
      `${stars} ${rating}${category ? " · " + helper.category : ""}\n` +
      helper.description.slice(0, 160)
    );
    const shareUrl = `${spaBase}/share/helper/${helperId}`;

    // Avatar is primary og:image — it's the person's face, most recognisable.
    // If avatar isn't set, fall back to icon.png (branded default, not the banner).
    // Banner is kept as a secondary image for platforms that support multiple og:images.
    const DEFAULT_IMAGE = `${spaBase}/icon.png`;
    const avatarImage = helper.avatarUrl || DEFAULT_IMAGE;
    const bannerImage = helper.bannerUrl || "";

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${name} – Do It Together</title>

  <!-- Avatar is primary og:image (the person, shown in all platforms) -->
  <meta property="og:type"         content="profile"/>
  <meta property="og:site_name"    content="Do It Together"/>
  <meta property="og:url"          content="${shareUrl}"/>
  <meta property="og:title"        content="${name}"/>
  <meta property="og:description"  content="${desc}"/>
  <meta property="og:image"        content="${avatarImage}"/>
  <meta property="og:image:width"  content="400"/>
  <meta property="og:image:height" content="400"/>

  ${bannerImage ? `<!-- Banner as secondary image (shown on platforms that support multiple images) -->
  <meta property="og:image"        content="${bannerImage}"/>
  <meta property="og:image:width"  content="1200"/>
  <meta property="og:image:height" content="630"/>` : ""}

  <!-- Twitter uses summary (square) to show avatar nicely -->
  <meta name="twitter:card"        content="summary"/>
  <meta name="twitter:title"       content="${name}"/>
  <meta name="twitter:description" content="${desc}"/>
  <meta name="twitter:image"       content="${avatarImage}"/>

  <meta http-equiv="refresh" content="0; url=${spaUrl}"/>
</head>
<body><p>Redirecting to <a href="${spaUrl}">${name}'s profile</a>…</p></body>
</html>`);
  } catch (err) {
    console.error("shareHelper error:", err);
    res.redirect(302, spaUrl);
  }
});
