import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Helper } from '../models/Helper';
import { db } from '../firebaseConfig'; // Import your Firebase configuration
import { storage } from '../firebaseConfig'; // Adjust the import as needed
class HelperService {
  
  private helperCollection: any // Firestore collection name

  constructor() {
    // this.db = db;
    this.helperCollection = collection(db, 'helpers'); // Assuming 'cards' is your Firestore collection name
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