import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore"; 
import db from "../fire.js"
const rol = collection(db, "rol");

const getRoles = async function(){
  const rolSnapshot = await getDocs(rol);
  const rolList = rolSnapshot.docs.map(doc => doc.data());
  return rolList;
}

const login = async function(username, password){
    let roles = await getRoles();
    console.log(roles)
    return true;
}
const runUser = function(app){
    app.get("/login", async (req, res, next) => {
        var res = await login();
        res.json({
        data: res,
        msg:"welcome >:3"
        });
    });
}

export default runUser;