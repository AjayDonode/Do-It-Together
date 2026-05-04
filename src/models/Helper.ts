import { Address } from "./UserProfile";
import { Review } from "./Review";

export interface Helper {
  avatar: string;
  banner: string;
  name: string;
  email: string;
  contact: string;
  info: string;
  id: string;
  title: string;
  description: string;
  rating: number;        // Average rating (e.g., 4.5)
  ratingCount: number;   // Number of ratings received
  reviews: Review[];     // Array of reviews
  zipcodes?: string[];   // Legacy: zip codes only (Yelp seed data)
  serviceAreas?: string[]; // Denormalized: city names + zips expanded at write time for array-contains search
  category: string;
  tags: string[];
  // ── Fields populated by Yelp seed ──
  address?: string;      // Full street address
  hours?: string;        // Business hours string (e.g. "Mon-Fri 8AM-5PM")
  website?: string;      // Business website or Yelp URL
  yelpId?: string;       // Yelp business ID for dedup
  source?: string;       // 'yelp' | 'manual'
  // ── Claim status ──
  claimed?: boolean;
  claimedByUserId?: string;
  claimedAt?: any;
  showcaseImages?: string[];  // up to 5 uploaded images
}

export interface ProDetails {
  companyName: string; // Required for Pros
  bio:string
  websiteUrl?: string; // Optional URL, validated
  serviceAreas: string[]; // Expanded search index: city names + all associated zips (write-time denormalized)
  rawServiceAreas?: string[]; // What the user actually typed — used to pre-fill the edit form
  services:Service[]
  yearsInBusiness: number; // Required, validated as positive integer
  hourlyRate?: { min: number; max: number }; // Optional range
  availability: string; // e.g., 'Mon-Fri 8AM-5PM', optional
  languages: string[]; // e.g., ['English', 'Spanish'], optional
  insurance: boolean; // Yes/No for liability insurance
  certifications: string[]; // e.g., ['Licensed Plumber'], optional with upload proof
  backgroundChecked: boolean; // Trust flag, integrate with external API
}

export interface Service {
  id: string; // Auto-generated ID
  name: string; // e.g., 'Plumbing Repair', required  
  subcategories?: string[]; // e.g., ['Leak Fixing', 'Installation']
}