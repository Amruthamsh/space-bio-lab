// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPBNm_xqoqVc3hY0m8_z1MCnDVoiEZMfg",
  authDomain: "space-bio-lab.firebaseapp.com",
  projectId: "space-bio-lab",
  storageBucket: "space-bio-lab.appspot.com",
  messagingSenderId: "304227685831",
  appId: "1:304227685831:web:fc29f1d294276d2fb475e2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
