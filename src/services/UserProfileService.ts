// ProfileService.ts
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {db} from '../firebaseConfig';
import { CustomUserProfile } from '../models/CustomUserProfile';


class UserProfileService {
  static async saveProfile(userId: string, profileData: CustomUserProfile) {
    try {
      const userDocRef = doc(db, 'users', userId); // Reference to the user's document
      await setDoc(userDocRef, profileData, { merge: true }); // Merge existing data
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  static async getProfile(userId: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log('No profile found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }
}

export default UserProfileService;
