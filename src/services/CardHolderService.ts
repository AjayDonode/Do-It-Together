import { collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CardHolder } from '../models/CardHolder';

const cardHolderCollection = collection(db, 'cardHolders');

export const createCardHolder = async (userId: string, name: string): Promise<string> => {
  const docRef = await addDoc(cardHolderCollection, {
    name,
    userId,
    helperIds: [],
  });
  return docRef.id;
};

export const getCardHolders = async (userId: string): Promise<CardHolder[]> => {
  const q = query(cardHolderCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const cardHolders: CardHolder[] = [];
  querySnapshot.forEach((doc) => {
    cardHolders.push({ id: doc.id, ...doc.data() } as CardHolder);
  });
  return cardHolders;
};

export const addHelperToCardHolder = async (cardHolderId: string, helperId: string): Promise<void> => {
  const cardHolderRef = doc(db, 'cardHolders', cardHolderId);
  await updateDoc(cardHolderRef, {
    helperIds: arrayUnion(helperId),
  });
};

export const removeHelperFromCardHolder = async (cardHolderId: string, helperId: string): Promise<void> => {
  const cardHolderRef = doc(db, 'cardHolders', cardHolderId);
  await updateDoc(cardHolderRef, {
    helperIds: arrayRemove(helperId),
  });
};

export const deleteCardHolder = async (cardHolderId: string): Promise<void> => {
  const cardHolderRef = doc(db, 'cardHolders', cardHolderId);
  await deleteDoc(cardHolderRef);
};
