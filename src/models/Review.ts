export interface Review {
  userId: string; // ID of the user who left the review
  rating: number; // Individual rating given by the user
  comment: string; // Review comment
  timestamp: Date; // When the review was created
}