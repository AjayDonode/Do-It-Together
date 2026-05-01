export interface Conversation {
  id: string;
  userId: string;
  helperId: string;
  helperName: string;
  helperAvatar: string;
  userName: string;
  userAvatar: string;
  createdAt: any;      // Firestore Timestamp
  lastMessage: string;
  lastMessageAt: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;    // userId or 'helper'
  text: string;
  createdAt: any;      // Firestore Timestamp
  isFromHelper: boolean;
}
