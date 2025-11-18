import { Address } from "./UserProfile";
import { Review } from "./Review";

export interface Helper {
  avatar: string;
  banner:string;
  name: string ;
  email: string;
  contact: string;
  info: string;
  id: string;
  title: string;
  description: string;
  rating: number; // Average rating (e.g., 4.5)
  ratingCount: number; // Number of ratings received
  reviews: Review[]; // Array of reviews
  zipcodes?: string[]; // Optional location field
  category:string;
  tags:string[];
  // specialties?: string[]; // Optional array of specialties or skills
}

export interface ProDetails {
  companyName: string; // Required for Pros
  bio:string
  websiteUrl?: string; // Optional URL, validated
  serviceAreas: string[]; // Array of zips/cities (e.g., ['Seattle', '98101']), required for search matching
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