//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
import * as sec from "../sec.js"
import * as free from "../free.js"
import * as user from "./user.js"
const reg = db.collection("reg");

const newId = async function(){
  console.log("generate new id for reg")
  let id = await free.gen({low:"true", up:"true", num:"true", len:20})
  let getregquery = await reg.doc(id).get().then((querySnapshot) => {
    return querySnapshot
  })
  while(!(getregquery == undefined || getregquery == {})){
    id = await free.gen({low:"true", up:"true", num:"true", len:20})
    getregquery = await reg.doc(id).get().then((querySnapshot) => {
    return querySnapshot
    })
  }
  return id
}

const newReg = async function(body){
  let resp = {
    data: "error",
    msg: ""
  }
  console.log("new register")
  console.log("start of body")
  console.log(body)
  console.log("end of body")
  if(body == undefined || body == ""){
    resp.msg = "please introduce data"
  }else{
    if(body.name == undefined || body.name == ""){
      resp.msg = "please introduce name"
    }else{
      if(body.value == undefined || body.value == ""){
        resp.msg = "please introduce the password"
      }else{
        if(body.token == undefined || body.token ==""){
          resp.msg = "invalid session"
        }else{
          const gettoken = sec.getToken(body.token)
          if(!(gettoken.valid == true)){
            resp.msg = "token not valid"
          }else{
            if(gettoken.data == undefined || gettoken.data == ""){
              resp.msg = "token has no data"
            }else{
              const userexists = await user.userExists(sec.from64(gettoken.data))
              if(!userexists){
                resp.msg = "user doesnt exist"
              }else{
                let newurl = ""
                if(body.url == undefined || body.url == ""){
                  newurl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                }else{
                  newurl = body.url
                }
                let newidthis = await newId()
                await reg.doc(newidthis).set({
                  reg_name : sec.to64(body.name),
                  reg_value : sec.encryptTextPublic(body.value),
                  reg_url : newurl,
                  usu_name : gettoken.data
                })
                resp.data = "success"
                resp.msg = newidthis
              }
            }
          }
        }
      }
    }
  }

  return resp
}

const getRegs = async function(body){
  console.log("get registers")
  let resp = {}
  if(body!=undefined){
    if(body.token!=null){
      const gettoken = await sec.getToken(body.token)
      if(JSON.stringify(gettoken) != "{}"){
        console.log("token value", gettoken)
        const username = gettoken.data
        console.log("from",sec.from64(username))
        const regSnapshot = await reg.where("usu_name", "==", username).get().then((querySnapshot) => {
          return querySnapshot
        })
        //crear una lista con los registros/contraseñas
        const regDocs = regSnapshot.docs.map(doc => doc.data());
        //las ids
        const regIDs = regSnapshot.docs.map(doc => doc.id);
        //juntarlas
        const regList = regIDs.map( function(x, i){
          return {"id": x, "name": regDocs[i].name}
        }, this);
        if(regList.length!=0){
          resp=regList
        }
      }
    }
  }
  return resp
}

//el main para que se pueda ejecutar desde una url
const runReg = async function(app){
  //obtener los roles en la api con un get porque me da flojera hacer las pruebas bien haha salu3
  app.post("/getRegs", async (req, res, next) => {
      var resp = await getRegs(req.body);
      res.json({
      data: resp,
      msg:"registers"
      });
  });
}

//exportar el main
export default runReg;

