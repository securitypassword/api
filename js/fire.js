// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase-admin/app";
//import { getAnalytics } from "firebase-admin/analytics";
import firebase from 'firebase-admin'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
//importar
import serviceAccount from "../key/securitypassword-9ad22-firebase-adminsdk-4mlo9-b8d69d2c03.json" assert {type: 'json'};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
//configurar
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
//inicializar
const app = initializeApp({credential: firebase.credential.cert(serviceAccount)});
//export const analytics = getAnalytics(app);

//declare database
//agarrar la base de datos de firestore
const db = firebase.firestore();

//export
export default db;