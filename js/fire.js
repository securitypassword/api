// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaTUXOCdUYzJpaOdbqUJqnjjpyDmkyJ3s",
  authDomain: "securitypassword-9ad22.firebaseapp.com",
  projectId: "securitypassword-9ad22",
  storageBucket: "securitypassword-9ad22.appspot.com",
  messagingSenderId: "919837629069",
  appId: "1:919837629069:web:a864ff7560a268ddf2e0c4",
  measurementId: "G-JRC4H91F32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//export const analytics = getAnalytics(app);
//declare database
const db = getFirestore(app);

//export
export default db;