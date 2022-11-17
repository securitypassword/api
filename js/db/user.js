import { collection, doc, setDoc } from "firebase/firestore"; 
import db from "../fire.js"
const rol = collection(db, "rol");

export const getRoles = async function(){
  const rolSnapshot = await getDocs(rol);
  const rolList = rolSnapshot.docs.map(doc => doc.data());
  return rolList;
}

export const login = async function(username, password){
    let roles = await getRoles();
    console.log(roles)
    return true;
}