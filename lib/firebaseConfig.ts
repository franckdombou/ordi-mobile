// Import the functions you need from the SDKs you need
import { initializeApp , getApps, getApp} from "firebase/app";
import { getAnalytics } from "firebase/analytics";
//import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { initializeAuth, } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { getReactNativePersistence } from 'firebase/auth/react-native';




const firebaseConfig = {
  apiKey: "AIzaSyAFTH0rNB8LdpLLyUL1TYp2kApGzsCI1Ag",
  authDomain: "sparkdb-22741.firebaseapp.com",
  projectId: "sparkdb-22741",
  storageBucket: "sparkdb-22741.appspot.com",
  messagingSenderId: "404739517444",
  appId: "1:404739517444:web:2de7aedc38c9e637a0d951"
};




const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
//const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };



// Initialize Firebase
/*const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);
const analytics = getAnalytics(app);
*/
