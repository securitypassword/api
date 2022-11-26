//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
import * as sec from "../sec.js"
import * as fs from 'fs';
import path from 'path';
const rol = db.collection("rol");
const user = db.collection("user");

import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

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

const getRole = async function(rol_id){
  let resp = ""
  console.log("get role",rol_id)
  const query = await rol.doc(rol_id.toString()).get().then((querySnapshot) => {
    return querySnapshot
  })
  console.log(query.data())
  if(query.data() != undefined){
    resp = query.data().name
  }
  return resp
}

const rolesTest = async function(username, password){
    let roles = await getRoles();
    console.log(roles)
    return true;
}

export const userExists = async function(testName){
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
      const exists = await userExists(body.name)
      if(exists){
        const userquery = await user.doc(sec.to64(body.name)).get().then((querySnapshot) => {
          return querySnapshot
        })
        const userdata = userquery.data()
        if(sec.sha(body.password)==userdata.usu_password){
          resp.valid= true
          resp.msg = "login"
          resp.usu_rol = userdata.usu_rol
          resp.data = userquery.id
          //generar un token y pasarselo al usuario
          const token = await sec.signToken(resp)
          resp.data = token
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
const deleteUser = async function(body){
  let resp={ valid : false ,
    msg : ""}
  if(body.name != undefined ){
    if(body.password != undefined){
      const exists = await userExists(body.name)
      if(exists){
        const logintokenhere = await loginToken(body)
        if(logintokenhere.msg!=undefined&&logintokenhere.msg!=""){
          if(logintokenhere.msg=="found"){
            if(logintokenhere.data!=undefined&&logintokenhere.data!=""){
              console.log("delete user",sec.from64(logintokenhere.data))
              await user.doc(logintokenhere.data).delete()
            }
          }
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

const loginToken = async function(body){
  console.log("login token")
  console.log(body.token)
  let resp = {
    data: "",
    msg: "not found"}
  if(body.token != undefined){
    const gettoken = await sec.getToken(body.token)
    if(JSON.stringify(gettoken) != "{}"){
      console.log("token value", gettoken)
      const username = gettoken.data
      //comprobar si es admin
      if(await userExists(sec.from64(username))){
        const userquery = await user.doc(username).get().then((querySnapshot) => {
          return querySnapshot
        })
        const userdata = userquery.data()
        const userrol = await getRole(userdata.usu_rol)
        if(userrol=="admin"){
          console.log(sec.from64(userdata.usu_name), "is admin")
          resp.admin = true
        }
        resp.msg = "found"
        resp.data = gettoken
      }
    }
  }
  return resp
}

const loginAdmin = async function(query){
  console.log("login as admin", query)
  let resp = false
  if(query != undefined && query != ""){
    if(query.token != undefined && query.token != ""){
      const gettoken = await sec.getToken(query.token)
      if(gettoken != undefined){
        if(gettoken.data != undefined && gettoken.data != ""){
          const getuser = await user.doc(gettoken.data).get().then((querySnapshot) => {
            return querySnapshot
          })
          if(getuser != undefined && getuser!= ""){
            const datafromuser = getuser.data()
            if(datafromuser.usu_rol!=undefined && datafromuser.usu_rol!=""){
              const rolfromuser = await getRole(datafromuser.usu_rol)
              if(rolfromuser=="admin"){
                console.log(datafromuser.usu_name,"is admin")
                resp=true
              }
            }
          }
        }
      }
    }
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
    const resp = reg
    res.end(JSON.stringify(resp));
  })
  app.post("/deleteUser",async (req, res, next) => {
    const reg = await deleteUser(req.body)
    const resp = reg
    res.end(JSON.stringify(resp));
  })
  app.post("/loginToken",async (req, res, next) => {
    const reg = await loginToken(req.body)
    const resp = reg
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
  app.post("/loginAdmin",async (req, res, next) => {
    const isadmin = await loginAdmin(req.body)
    if(isadmin){
      let filePath = path.join(__dirname, "html/admin.html");
      const resp = { data: "admin", msg: fs.readFileSync(filePath)}
      res.end(JSON.stringify(resp))
    }else{
      res.end(JSON.stringify({data:"invalid",
      msg : "login as admin"}))
    }
  })
}

//exportar el main
export default runUser;

