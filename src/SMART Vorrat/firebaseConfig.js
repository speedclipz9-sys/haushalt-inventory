import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCN6pei4PfTvT9-_s3UPABhOJGj-xfm3P0",
  authDomain: "haushalt-inventroy.firebaseapp.com",
  databaseURL: "https://haushalt-inventroy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "haushalt-inventroy",
  storageBucket: "haushalt-inventroy.firebasestorage.app",
  messagingSenderId: "899421907808",
  appId: "1:899421907808:web:0d0bec862f72b734768c05",
  measurementId: "G-7PSZEQJD33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;