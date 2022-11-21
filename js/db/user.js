//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
import * as sec from "../sec.js"
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
  const query = await user.where("usu_name", "==", sec.to64(testName)).get().then((querySnapshot) => {
    return querySnapshot
  })
  console.log("does", sec.to64(testName), testName,"exist?")
  const existing = query.docs.map(doc => doc.data());
  console.log(existing, existing.length)
  const exists = existing.length != 0
  console.log(exists)
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
import e from "express";

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
      await user.doc(sec.to64(body.name)).set({
        usu_name : sec.to64(body.name),
        usu_email : sec.to64(body.email),
        usu_password : sec.sha(body.password),
        usu_rol : 1,
        usu_autodelete : false,
        usu_autodel_count : 0
      })
      resp = {
        data : "success" , 
        msg : sec.to64(body.name)
      }
    } 
  }
  }
  }
  }
  return resp
}

const login = async function(body){
  let resp={ valid : false ,
    msg : ""}
  if(body.name != undefined ){
    if(body.password != undefined){
      const exists = await userExists(sec.to64(body.name))
      if(exists){
        const userquery = await user.doc(sec.to64(body.name)).get().then((querySnapshot) => {
          return querySnapshot
        })
        const userdata = userquery.data()
        if(sec.sha(body.password)==userdata.password){
          resp.valid= true
          resp.data = userquery.id
          resp.msg = "login"
          await sec.signToken(resp)
        }else{
          resp.msg = "incorrecto password"
        }
      }else{
        resp.msg = "enter a valid name"   
      }
    }else{
      resp.msg = "enter a password"
    }
  }else{
    resp.msg = "enter a name"
  }
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
    const reg = await login(req.body)
    const resp = {
      data : reg.data,
      msg : reg.msg
    }
    res.end(JSON.stringify(resp));
    
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

