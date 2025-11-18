import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { Helper } from '../models/Helper';
import { db } from '../firebaseConfig';

const helperCollection = collection(db, 'helpers');

export const createHelper = async (helper: Helper): Promise<void> => {
  try {
    await addDoc(helperCollection, helper);
    console.log('Helper added successfully');
  } catch (error) {
    console.error('Error adding helper:', error);
  }
};

export const getHelperById = async (id: string): Promise<Helper | null> => {
  try {
    const helperRef = doc(helperCollection, id);
    const helperDoc = await getDoc(helperRef);
    
    if (helperDoc.exists()) {
      const data = helperDoc.data() as Helper;
      return { ...data, id: helperDoc.id };
    } else {
      console.log('No such helper document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching helper:', error);
    return null;
  }
};

export const getHelpers = async (): Promise<Helper[]> => {
  const helpers: Helper[] = [];
  try {
    const querySnapshot = await getDocs(helperCollection);
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Helper;
      helpers.push({ ...data, id: doc.id }); 
    });
  } catch (error) {
    console.error('Error fetching helpers:', error);
  }
  return helpers;
};

export const searchHelpers = async (queryString: string, zipcode: string): Promise<Helper[]> => {
  const helpers: Helper[] = [];
  try {
    let q: any = null;
    if (!queryString) {
      q = query(helperCollection,
        where('zipcodes', 'array-contains', zipcode));
    } else {
      q = query(helperCollection,
        where('category', '==', queryString),
        where('zipcodes', 'array-contains', zipcode));
    }
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Helper;
      helpers.push({ ...data, id: doc.id });
    });
  } catch (error) {
    console.error('Error searching helpers:', error);
  }
  return helpers;
};

export const updateHelper = async (id: string, updatedHelper: Partial<Helper>): Promise<void> => {
  try {
    const helperRef = doc(helperCollection, id);
    await updateDoc(helperRef, updatedHelper);
    console.log('Helper updated successfully');
  } catch (error) {
    console.error('Error updating helper:', error);
  }
};

export const deleteHelper = async (id: string): Promise<void> => {
  try {
    const helperRef = doc(helperCollection, id);
    await deleteDoc(helperRef);
    console.log('Helper deleted successfully');
  } catch (error) {
    console.error('Error deleting helper:', error);
  }
};
