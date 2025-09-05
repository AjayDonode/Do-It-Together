import { Review } from "./Review";

export interface Helper {
  avatar: string;
  banner:string;
  name: string ;
  info: string;
  id: string;
  title: string;
  description: string;
  rating: number; // Average rating (e.g., 4.5)
  ratingCount: number; // Number of ratings received
  reviews: Review[]; // Array of reviews
  location?: string; // Optional location field
  category:string;
  // specialties?: string[]; // Optional array of specialties or skills
}