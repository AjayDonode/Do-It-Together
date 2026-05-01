import {
  collection, addDoc, getDocs, query, where,
  serverTimestamp, doc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Hire } from '../models/Hire';

const hiresCol = collection(db, 'hires');

/** Record that the current user hired a helper. */
export const markAsHired = async (
  userId: string,
  helperId: string,
  rating: number,
  experience: string,
  userDisplayName: string,
  userAvatar: string,
): Promise<string> => {
  const docRef = await addDoc(hiresCol, {
    userId,
    helperId,
    hiredAt: serverTimestamp(),
    rating,
    experience,
    userDisplayName,
    userAvatar,
  });
  return docRef.id;
};

/** Update an existing hire record (re-rate / edit review). */
export const updateHire = async (
  hireId: string,
  rating: number,
  experience: string,
): Promise<void> => {
  await updateDoc(doc(db, 'hires', hireId), { rating, experience });
};

/** Delete a hire record. */
export const deleteHire = async (hireId: string): Promise<void> => {
  await deleteDoc(doc(db, 'hires', hireId));
};

/** Get ALL hires for a specific helper (for the "Who hired this" list). */
export const getHiresForHelper = async (helperId: string): Promise<Hire[]> => {
  const q = query(hiresCol, where('helperId', '==', helperId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Hire));
};

/** Check if the current user already has a hire record for this helper. */
export const getMyHire = async (
  userId: string,
  helperId: string,
): Promise<Hire | null> => {
  const q = query(
    hiresCol,
    where('userId', '==', userId),
    where('helperId', '==', helperId),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Hire;
};

/**
 * Given a set of connection userIds, return only the hires for this helper
 * made by those connections (for the "contacts who hired" badge).
 * Firestore 'in' limit is 30 — we chunk automatically.
 */
export const getConnectionHiresForHelper = async (
  helperId: string,
  connectionUserIds: string[],
): Promise<Hire[]> => {
  if (connectionUserIds.length === 0) return [];

  const results: Hire[] = [];
  const chunkSize = 30;

  for (let i = 0; i < connectionUserIds.length; i += chunkSize) {
    const chunk = connectionUserIds.slice(i, i + chunkSize);
    const q = query(
      hiresCol,
      where('helperId', '==', helperId),
      where('userId', 'in', chunk),
    );
    const snap = await getDocs(q);
    snap.docs.forEach(d => results.push({ id: d.id, ...d.data() } as Hire));
  }
  return results;
};
