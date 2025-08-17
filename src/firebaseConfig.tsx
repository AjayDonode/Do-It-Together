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
  apiKey: "AIzaSyCrIb09irO0bDgjNtrDBYawa1bTOUYsZD0",
  authDomain: "woodlandgardens-eca8f.firebaseapp.com",
  databaseURL: "https://woodlandgardens-eca8f-default-rtdb.firebaseio.com",
  projectId: "woodlandgardens-eca8f",
  storageBucket: "woodlandgardens-eca8f.firebasestorage.app",
  messagingSenderId: "440336977215",
  appId: "1:440336977215:web:2f66a3827a476b1b67d78a",
  measurementId: "G-PDN9THS8NT"
};

// Initialize Firebase

const firebase = initializeApp(firebaseConfig); 
const storage = getStorage(firebase);  
const db = getFirestore(firebase); 

export const auth = getAuth(firebase);

export { db , storage};