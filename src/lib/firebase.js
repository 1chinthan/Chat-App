// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chat-50d6a.firebaseapp.com",
  projectId: "chat-50d6a",
  storageBucket: "chat-50d6a.appspot.com",
  messagingSenderId: "586640441697",
  appId: "1:586640441697:web:3b23c619287ef415040520",
  measurementId: "G-HV907ZVC3V",
};
/* console.log(import.meta.env.VITE_API_KEY)
console.log(import.meta.env.VITE_TEST_VARIABLE); */ // Should log 'hello_world'


// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);


export const auth =getAuth();
export const db=getFirestore();
export const storage=getStorage();