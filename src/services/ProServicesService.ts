import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Service } from '../models/Helper';

class ProServicesService {
  private serviceCollection: any;

  constructor() {
    this.serviceCollection = collection(db, 'serviceCategories');
  }

  async getCategories(): Promise<Service[]> {
    const serviceCategories: Service[] = [];
    try {
      const querySnapshot = await getDocs(this.serviceCollection);
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Service, 'id'>;
        serviceCategories.push({ id: docSnapshot.id, ...data });
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error; // Re-throw for caller handling
    }
    return serviceCategories;
  }

  async addCategory(name: string): Promise<string> {
    try {
      const newCategory: Omit<Service, 'id'> = {
        name,
        subcategories: [], // Start with empty subcategories
      };
      const docRef = await addDoc(this.serviceCollection, newCategory);
      return docRef.id; // Return the new document ID
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, updatedData: Partial<Service>): Promise<void> {
    try {
      const categoryRef = doc(this.serviceCollection, id);
      await updateDoc(categoryRef, updatedData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const categoryRef = doc(this.serviceCollection, id);
      await deleteDoc(categoryRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async searchCategories(query: string): Promise<Service[]> {
    try {
      const allCategories = await this.getCategories();
      const lowerQuery = query.toLowerCase();
      return allCategories.filter((cat) => cat.name.toLowerCase().includes(lowerQuery));
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  }
}

export default ProServicesService;
