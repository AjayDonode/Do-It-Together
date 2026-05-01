export interface Hire {
  id: string;
  userId: string;           // who hired
  helperId: string;         // which helper
  hiredAt: any;             // Firestore Timestamp
  rating: number;           // 1–5
  experience: string;       // text review
  // Denormalized for fast card display (no extra fetch needed)
  userDisplayName: string;
  userAvatar: string;
}
