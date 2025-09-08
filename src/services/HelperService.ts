import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Helper } from '../models/Helper';
import { db } from '../firebaseConfig'; // Import your Firebase configuration

class HelperService {
  private helperCollection: any // Firestore collection name

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

  // Read all helpers
  async getHelpers(): Promise<Helper[]> {
    const helpers: Helper[] = [];
    try {
      const querySnapshot = await getDocs(this.helperCollection);
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Helper;
        helpers.push({ ...data }); // Include Firestore document ID
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
          where('zipcodes', 'array-contains', zipcode)); // Adjust the field and operator as needed
      }
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Helper;
        helpers.push({ ...data, id: doc.id }); // Include Firestore document ID
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