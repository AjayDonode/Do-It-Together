export interface Review {
  reviewId: string; // Auto-generated
  proProfileId: string; // Foreign key to Profile.userId (required)
  reviewerUserId: string; // Foreign key to User.uid (required)
  rating: number; // 1-5 stars, required
  comment?: string; // Optional text
  createdAt: Date; // Timestamp
  photos?: string[]; // Optional review photos
}