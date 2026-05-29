// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9qDW4ogSZB666z7659ZaCw-asZUoQDUI",
  authDomain: "sistema-midia-semsa.firebaseapp.com",
  projectId: "sistema-midia-semsa",
  storageBucket: "sistema-midia-semsa.firebasestorage.app",
  messagingSenderId: "645515573455",
  appId: "1:645515573455:web:02f149e36c19813b739fba",
  measurementId: "G-0602K34NZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);