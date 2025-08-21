// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage'; // Import getStorage

import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup 
} from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwaAJS8ptpoe3dZFrk1kid48G5mhgodQU",
  authDomain: "doitto-fdce8.firebaseapp.com",
  projectId: "doitto-fdce8",
  storageBucket: "doitto-fdce8.firebasestorage.app",
  messagingSenderId: "669070473282",
  appId: "1:669070473282:web:57ed4ad15f04b841ab55db",
  measurementId: "G-H40YXZSW21"
};



const firebase = initializeApp(firebaseConfig); 
const storage = getStorage(firebase);  
const db = getFirestore(firebase); 

export const auth = getAuth(firebase);
export { db , storage};