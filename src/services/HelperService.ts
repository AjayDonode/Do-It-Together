import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { Helper } from '../models/Helper';
import { db } from '../firebaseConfig';

const helperCollection = collection(db, 'helpers');

export const createHelper = async (helper: Helper): Promise<string> => {
  try {
    const docRef = await addDoc(helperCollection, helper);
    console.log('Helper added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding helper:', error);
    throw error;
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

export const getDistinctCategories = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(helperCollection);
    const cats = new Set<string>();
    querySnapshot.forEach((doc) => {
      const cat = (doc.data() as Helper).category;
      if (cat) cats.add(cat.trim());
    });
    return Array.from(cats).sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};



export const searchHelpers = async (category: string, location: string): Promise<Helper[]> => {
  const { normalizeSearchLocation } = await import('../utils/locationUtils');
  const locationToken = normalizeSearchLocation(location);

  const runQuery = async (locationField: string): Promise<Helper[]> => {
    const results: Helper[] = [];
    try {
      const q = category
        ? query(helperCollection,
            where('category', '==', category),
            where(locationField, 'array-contains', locationToken))
        : query(helperCollection,
            where(locationField, 'array-contains', locationToken));
      const snap = await getDocs(q);
      snap.forEach(doc => results.push({ ...(doc.data() as Helper), id: doc.id }));
    } catch (err) {
      console.error(`searchHelpers [${locationField}] error:`, err);
    }
    return results;
  };

  // Try the new denormalized serviceAreas field first
  let helpers = await runQuery('serviceAreas');

  // Fall back to legacy zipcodes for Yelp-seeded records
  if (helpers.length === 0) {
    helpers = await runQuery('zipcodes');
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
