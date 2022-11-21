//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
const rol = db.collection("rol");
const user = db.collection("user");

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

const userExists = async function(testName){
  const query = await user.where("usu_name", "==", testName).get().then((querySnapshot) => {
    return querySnapshot
  })
  console.log("does",testName,"exist?")
  const existing = query.docs.map(doc => doc.data());
  console.log(existing)
  const exists = existing == []
  return exists
}
const userIdExists = async function(testId){
  const existing = await user.doc(testId).get()
  console.log("does",testId,"id exist?")
  console.log(existing)
  const exists = !(existing == [] || existing == undefined)
  return exists
}

import gen from "../free.js"
const newId = async function(){
  let id = "demma"
  let exists = await user.doc(id).get()
  const query = { low : "true" ,
    up : "true" ,
    nums : "true" ,
    len : "32" }
  while(exists==undefined || exists == []){
    id = gen(query)
    exists = await user.doc(id).get()
  }
  return id
}

const register = async function(body){
  console.log("register")
  console.log("start of body")
  console.log(body)
  console.log("end of body")
  let resp = {}
  if(body == undefined){
    resp = {
      data : "error" ,
      msg : "please introduce data"
    }
  } else {
  if(body.name == undefined || body.name == ""){ 
  resp = {
    data : "error" ,
    msg : "please introduce name"
  }
  }else{
  if(body.email == undefined || body.email == ""){
    resp = {
      data : "error" ,
      msg : "please introduce email"
    }
  }else{
  if(body.password == undefined || body.password == ""){
    resp = {
      data : "error" ,
      msg : "please introduce password"
    }
  }else{
    if(await userExists(body.name)){
      resp = {
        data : "error" ,
        msg : "already registered"
      }
    }else{
      console.log("success",body.name)
      const id = await newId()
      await user.doc(id).set({
        usu_name : body.name,
        usu_email : body.email,
        usu_password : CryptoJS.SHA256(body.password),
        usu_autodelete : false,
        usu_autodel_count : 0
      })
      resp = {
        data : "success" , 
        msg : id
      }
    } 
  }
  }
  }
  }
  return resp
}

const login = async function(name, password){
  let resp={ valid : false }

  return resp
}
//el main para que se pueda ejecutar desde una url
const runUser = async function(app){
  //obtener los roles en la api con un get porque me da flojera hacer las pruebas bien haha salu3
  app.get("/rol", async (req, res, next) => {
      var resp = await rolesTest();
      res.json({
      data: resp,
      msg:"rol"
      });
  });
  app.post("/login",async (req, res, next) => {
    
  })
  app.post("/register",async (req, res, next) => {
    const reg = await register(req.body)
    const resp = {
      data : reg.data,
      msg : reg.msg
    }
    res.end(JSON.stringify(resp));
  })
}

//exportar el main
export default runUser;

