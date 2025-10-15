import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { Helper } from '../models/Helper';
import { db } from '../firebaseConfig';

class HelperService {
  private helperCollection: any;

  constructor() {
    this.helperCollection = collection(db, 'helpers');
  }

  // Create a new helper
  async createHelper(helper: Helper): Promise<void> {
    try {
      await addDoc(this.helperCollection, helper);
      console.log('Helper added successfully');
    } catch (error) {
      console.error('Error adding helper:', error);
    }
  }

  // Get a single helper by ID
  async getHelperById(id: string): Promise<Helper | null> {
    try {
      const helperRef = doc(this.helperCollection, id);
      const helperDoc = await getDoc(helperRef);
      
      if (helperDoc.exists()) {
        const data = helperDoc.data() as Helper;
        return { ...data, id: helperDoc.id }; // Correctly include ID
      } else {
        console.log('No such helper document!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching helper:', error);
      return null;
    }
  }

  // Read all helpers - FIXED: Include document ID
  async getHelpers(): Promise<Helper[]> {
    const helpers: Helper[] = [];
    try {
      const querySnapshot = await getDocs(this.helperCollection);
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Helper;
        console.log("Data " + data.name);
        helpers.push({ ...data, id: doc.id }); // FIXED: Include Firestore document ID
      });
    } catch (error) {
      console.error('Error fetching helpers:', error);
    }
    return helpers;
  }

  async searchHelpers(queryString: string, zipcode: string): Promise<Helper[]> {
    const helpers: Helper[] = [];
    try {
      let q: any = null;
      if (!queryString) {
        q = query(this.helperCollection,
          where('zipcodes', 'array-contains', zipcode));
      } else {
        q = query(this.helperCollection,
          where('category', '==', queryString),
          where('zipcodes', 'array-contains', zipcode));
      }
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Helper;
        helpers.push({ ...data, id: doc.id }); // Correct
      });
    } catch (error) {
      console.error('Error searching helpers:', error);
    }
    return helpers;
  }

  // Update a helper by ID
  async updateHelper(id: string, updatedHelper: Partial<Helper>): Promise<void> {
    try {
      const helperRef = doc(this.helperCollection, id);
      await updateDoc(helperRef, updatedHelper);
      console.log('Helper updated successfully');
    } catch (error) {
      console.error('Error updating helper:', error);
    }
  }

  // Delete a helper by ID
  async deleteHelper(id: string): Promise<void> {
    try {
      const helperRef = doc(this.helperCollection, id);
      await deleteDoc(helperRef);
      console.log('Helper deleted successfully');
    } catch (error) {
      console.error('Error deleting helper:', error);
    }
  }
}

export default HelperService;
