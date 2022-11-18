//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore"; 
import db from "../fire.js"
const rol = db.collection("rol");

const getRoles = async function(){
  //obtener la coleccion de roles
  const rolSnapshot = await rol.get().then((querySnapshot) => {
    return querySnapshot
  })
  //crear una lista con los documentos y las ids
  const rolList = rolSnapshot.docs.map(doc => doc.data());
  return rolList;
}

const login = async function(username, password){
    let roles = await getRoles();
    console.log(roles)
    return true;
}

//el main para que se pueda ejecutar desde una url
const runUser = function(app){
    app.get("/login", async (req, res, next) => {
        var resp = await login();
        res.json({
        data: resp,
        msg:"login"
        });
    });
}

//exportar el main
export default runUser;