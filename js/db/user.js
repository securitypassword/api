//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
import * as sec from "../sec.js"
import * as fs from 'fs';
import { sendEmail } from "../email.js";
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
  const exists = existing.length != 0
  console.log(exists)
  return exists
}
export const userExistsEmail = async function(testEmail){
  const query = await user.where("usu_email", "==", sec.to64(testEmail)).get().then((querySnapshot) => {
    return querySnapshot
  })
  console.log("does", sec.to64(testEmail), testEmail,"exist?")
  const existing = query.docs.map(doc => doc.data());
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
    const userexiststhis = await userExists(body.name)
    const emailexiststhis = await userExistsEmail(body.email)
    if(userexiststhis){
      resp = {
        data : "error" ,
        msg : "El nombre de usuario ya está en uso"
      }
    }else if(emailexiststhis){
      resp = {
        data : "error" ,
        msg : "El email ya está en uso"
      }
    }else{
      await user.doc(sec.to64(body.name)).set({
        usu_name : sec.to64(body.name),
        usu_email : sec.to64(body.email),
        usu_password : sec.sha(body.password),
        usu_rol : 1,
        usu_autodelete : false,
        usu_autodel_count : 0,
        usu_has_question:false,
        usu_question:"",
        usu_answer:""
      })
      const emailSent = "Cuenta creada con éxito en https://securitypassword.github.io"
      await sendEmail(body.email, "security password", emailSent)
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
  if(body.name != undefined && body.name != ""){
    if(body.password != undefined && body.password != ""){
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
          resp.msg = "Contraseña incorrecta"
          if(userdata.usu_autodelete){
            const newcount = userdata.usu_autodel_count+1
            console.log("autodel from",userdata.usu_name,"to",newcount)
            await user.doc(userdata.usu_name).update({usu_autodel_count: newcount})
            if(newcount>5){
              await user.doc(userdata.usu_name).delete()
              console.log("deleted",userdata.usu_name)
              resp.msg = "deleted the account"
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

const deleteUserBD = async function(id){
  console.log("delete user", id)
  await user.doc(id).delete()
  const reg = db.collection("reg")
  let regs = await reg.where("usu_name", "==", id).get().then((querySnapshot) => {
    return querySnapshot
  })
  const regDocs = regs.docs.map(doc => doc.data());
  //las ids
  const regIDs = regs.docs.map(doc => doc.id);
  for(let i in regIDs){
    await reg.doc(regIDs[i]).set({
      reg_bin : true,
      reg_count : 72
    })
  }
  return true
}
const deleteUser = async function(body){
  let resp={ valid : false ,
    msg : ""}
    if(body.password != undefined && body.password != ""){
          const logintokenhere = await loginToken(body)
          if(logintokenhere.msg!=undefined && logintokenhere.msg!=""){
            if(logintokenhere.msg=="found"){
              if(logintokenhere.data!=undefined && logintokenhere.data!=""){
                const usu = await user.doc(logintokenhere.data.data).get().then((querySnapshot) => {
                  return querySnapshot
                })
                if(sec.sha(body.password)==usu.data().usu_password){
                const emailSent = "Your account has been deleted"
                await sendEmail(sec.from64(usu.data().usu_email), "security password", emailSent)
                await deleteUserBD(logintokenhere.data.data)
              }
              else{
              resp.msg = "wrong password"
            }
            }
            else{
            resp.msg = "invalid token data"
          }
          }
          else{
          resp.msg = "token not found"
        }
        }
        else{
        resp.msg = "token invalid"
      }
      }
      else{
      resp.msg = "enter a password"
    }
  return resp
}

const loginToken = async function(body){
  console.log("login token")
  let resp = {
    data: "",
    msg: "not found"}
  if(body.token != undefined){
    const gettoken = await sec.getToken(body.token)
    if(JSON.stringify(gettoken) != "{}"){
      const username = gettoken.data
      //comprobar si es admin
      if(await userExists(sec.from64(username))){
        const userquery = await user.doc(username).get().then((querySnapshot) => {
          return querySnapshot
        })
        const userdata = userquery.data()
        const userrol = await getRole(userdata.usu_rol)
        if(userrol=="admin"){
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
const makeAdmin = async (body) => {
  let resp = {
    data: "",
    msg: "error"
  }
  if(query != undefined && query != ""){
    if(body.id != undefined && body.id != ""){
      if(await userExists(sec.from64(body.id))){
        const gettoken = await sec.getToken(body.token)
        const usu = await user.doc(body.id).get().then((querySnapshot) => {
            return querySnapshot
          })
        await user.doc(sec.from64(body.id)).update({
            usu_rol : 42})
        const emailSent = sec.from64(gettoken.data) + " made you admin at https://securitypassword.github.io"
        await sendEmail(sec.from64(usu.data().usu_email), "security password", emailSent)
      }
      else{
        resp.data = "user doesnt exist"
      }
    }
    else{
      resp.data = "ingrese una id"
    }
  }
}

const deleteAccount = async function(query){
  console.log("delete account", query)
  let resp = {
    data : "",
    msg : "error"
  }
  if(query != undefined && query != ""){
    if(query.token != undefined && query.token != ""){
      const gettoken = await sec.getToken(query.token)
      if(gettoken != undefined){
        if(gettoken.data != undefined && gettoken.data != ""){
          await user.delete(gettoken.data)
        }
      }
      else{
        resp.msg = "please introduce valid token"
      }
    }
    else{
      resp.msg = "please introduce token"
    }
  }
  else{
    resp.msg = "please introduce data"
  }
  return resp
}
//el main para que se pueda ejecutar desde una url
const runUser = async function(app){

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
    app.post("/makeAdmin",async (req, res, next) => {
      let resp = {
        data: "no",
        msg: "error"
      }
      const isadmin = await loginAdmin(req.body)
      if(isadmin){
        resp = await makeAdmin(req.body)
      }
      else{
        resp.data = "you are not an admin"
      }
      res.end(JSON.stringify(resp))
    })
    /*
    app.post("/deleteAccount",async (req, res, next) => {
      const resp = await deleteAccount(req.body)
      res.end(JSON.stringify(resp));
  })*/
  })
}

//exportar el main
export default runUser;

