//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
const rol = db.collection("rol");

const getRoles = async function(){
  //obtener la coleccion de roles
  const rolSnapshot = await rol.get().then((querySnapshot) => {
    return querySnapshot
  })
  //crear una lista con los documentos
  const rolDocs = rolSnapshot.docs.map(doc => doc.data());
  //las ids
  const rolIDs = rolSnapshot.docs.map(doc => doc.id);
  //juntarlas
  const rolList = rolIDs.map( function(x, i){
    return {"id": x, "name": rolDocs[i].name}
  }, this);
  return rolList;
}

const rolesTest = async function(username, password){
    let roles = await getRoles();
    console.log(roles)
    return true;
}

//el main para que se pueda ejecutar desde una url
const runUser = function(app){
  //obtener los roles en la api con un get porque me da flojera hacer las pruebas bien haha salu3
  app.get("/rol", async (req, res, next) => {
      var resp = await rolesTest();
      res.json({
      data: resp,
      msg:"rol"
      });
  });
}

//exportar el main
export default runUser;

