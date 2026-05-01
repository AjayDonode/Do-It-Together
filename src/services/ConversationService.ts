import {
  collection, addDoc, getDocs, query, where, orderBy,
  serverTimestamp, onSnapshot, doc, updateDoc, Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Conversation, ChatMessage } from '../models/Conversation';

const convsCol = collection(db, 'conversations');

/** Find or create a conversation between this user and a helper. Returns the conversation ID. */
export const getOrCreateConversation = async (
  userId: string,
  helperId: string,
  helperName: string,
  helperAvatar: string,
  userName: string,
  userAvatar: string,
): Promise<string> => {
  // Check for existing conversation
  const q = query(
    convsCol,
    where('userId', '==', userId),
    where('helperId', '==', helperId),
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  // Create a new one
  const ref = await addDoc(convsCol, {
    userId,
    helperId,
    helperName,
    helperAvatar,
    userName,
    userAvatar,
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
  });
  return ref.id;
};

/** Send a message in a conversation. */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string,
  isFromHelper: boolean,
): Promise<void> => {
  const messagesCol = collection(db, 'conversations', conversationId, 'messages');
  await addDoc(messagesCol, {
    senderId,
    text,
    createdAt: serverTimestamp(),
    isFromHelper,
  });
  // Update last message on conversation doc
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
};

/** Subscribe to messages in a conversation (real-time). Returns unsubscribe fn. */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void,
): Unsubscribe => {
  const messagesCol = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const msgs: ChatMessage[] = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    } as ChatMessage));
    callback(msgs);
  });
};

/** Get all conversations for a user (for a future inbox screen). */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  const q = query(convsCol, where('userId', '==', userId), orderBy('lastMessageAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
};
