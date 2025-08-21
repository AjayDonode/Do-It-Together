import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Helper } from '../models/Helper';

class HelperService {
  private db: Firestore;
  private collectionName: string = 'helpers'; // Firestore collection name

  constructor(db: Firestore) {
    this.db = db;
  }

  // Create a new helper
  async createHelper(helper: Helper): Promise<void> {
    try {
      await addDoc(collection(this.db, this.collectionName), helper);
      console.log('Helper added successfully');
    } catch (error) {
      console.error('Error adding helper:', error);
    }
  }

  // Read all helpers
  async getHelpers(): Promise<Helper[]> {
    const helpers: Helper[] = [];
    try {
      const querySnapshot = await getDocs(collection(this.db, this.collectionName));
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Helper;
        helpers.push({ ...data, id: doc.id }); // Include Firestore document ID
      });
    } catch (error) {
      console.error('Error fetching helpers:', error);
    }
    return helpers;
  }

  // Update a helper by ID
  async updateHelper(id: string, updatedHelper: Partial<Helper>): Promise<void> {
    try {
      const helperRef = doc(this.db, this.collectionName, id);
      await updateDoc(helperRef, updatedHelper);
      console.log('Helper updated successfully');
    } catch (error) {
      console.error('Error updating helper:', error);
    }
  }

  // Delete a helper by ID
  async deleteHelper(id: string): Promise<void> {
    try {
      const helperRef = doc(this.db, this.collectionName, id);
      await deleteDoc(helperRef);
      console.log('Helper deleted successfully');
    } catch (error) {
      console.error('Error deleting helper:', error);
    }
  }
}
