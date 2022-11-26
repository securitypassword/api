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
  console.log(getregquery.data())
  console.log(id)
  while(getregquery.data() != undefined && getregquery.data() != {} && getregquery.data() != []){
    console.log(getregquery.data())
    id = await free.gen({low:"true", up:"true", num:"true", len:20})
    console.log(id)
    getregquery = await reg.doc(id).get().then((querySnapshot) => {
    return querySnapshot
    })
  }
  return id
}

const delReg = async function(body){
  console.log("deleting a register")
  let resp = {data:"error", msg:""}
  console.log("start of body")
  console.log(body)
  console.log("end of body")

  if(body == undefined || body == ""){
    resp.msg = "please introduce data"
  }else{
    if(body.id == undefined || body.id==""){
      resp.msg = "please introduce an id"
    }else{
      if(body.token == undefined || body.token == ""){
      resp.msg = "invalid session"
      }else{
        const gettoken = await sec.getToken(body.token)
        console.log(gettoken)
        if(gettoken.valid != true){
          resp.msg = "token not valid"
        }else{
          if(gettoken.data == undefined || gettoken.data == ""){
            resp.msg = "token has no data"
          }else{
            const userexists = await user.userExists(sec.from64(gettoken.data))
            if(!userexists){
              resp.msg = "user doesnt exist"
            }else{
              const regquery = await getRegs(body)
              for(let prevRegs in regquery){
                if(regquery[prevRegs].id==body.id){
                  await reg.doc(body.id).delete()
                  resp.data = "succes"
                  resp.msg = "" + body.id + " deleted"
                }
              }
            }
          }
        }
      }
    }
  }
  return resp
}

const setReg = async function(body){
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
          const gettoken = await sec.getToken(body.token)
          console.log(gettoken)
          if(gettoken.valid != true){
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
                const prevRegs = await getRegs({token:body.token})
                let alreadyExists= false
                let newidthis = "0"
                for(let prev in prevRegs){
                  if(prevRegs[prev].name==sec.to64(body.name)){
                    alreadyExists=true
                    newidthis=prevRegs[prev].id
                  }
                }
                if(!alreadyExists){
                  newidthis =await newId()
                }
                const newregvaluencrypt = sec.enc(body.value)
                const newregvalue = newregvaluencrypt.toString('base64')
                console.log("reg new id",newidthis)
                console.log("new reg value", newregvalue)
                await reg.doc(newidthis).set({
                  reg_name : sec.to64(body.name),
                  reg_value : newregvalue,
                  reg_url : sec.to64(newurl),
                  reg_bin : false,
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
    if(body.token!=null&&body.token!=""&&body.token!=undefined){
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
        let regList = []
        for(let i in regDocs){
          let gettingvalue = sec.dec(regDocs[i].reg_value)
          regList[i] = {"id": regIDs[i], "name": regDocs[i].reg_name, "url": regDocs[i].reg_url, "value": gettingvalue}
        };
        if(regList.length!=0){
          resp=regList
        }
      }
    }
  }
  console.log(resp)
  return resp
}

const getActiveRegs = async function(body){
  console.log("get active registers")
  let resp = {}
  if(body!=undefined){
    if(body.token!=null&&body.token!=""&&body.token!=undefined){
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
        let regList = []
        for(let i in regDocs){
          let gettingvalue = sec.dec(regDocs[i].reg_value)
          if(regDocs[i].reg_bin==false){
            regList.push({"id": regIDs[i], "name": regDocs[i].reg_name, "url": regDocs[i].reg_url, "value": gettingvalue})
          }
        };
        if(regList.length!=0){
          resp=regList
        }
      }
    }
  }
  console.log(resp)
  return resp
}

const getBinRegs = async function(body){
  console.log("get active registers")
  let resp = {}
  if(body!=undefined){
    if(body.token!=null&&body.token!=""&&body.token!=undefined){
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
        let regList = []
        for(let i in regDocs){
          let gettingvalue = sec.dec(regDocs[i].reg_value)
          if(regDocs[i].reg_bin==true){
            regList.push({"id": regIDs[i], "name": regDocs[i].reg_name, "url": regDocs[i].reg_url, "value": gettingvalue})
          }
        };
        if(regList.length!=0){
          resp=regList
        }
      }
    }
  }
  console.log(resp)
  return resp
}

//el main para que se pueda ejecutar desde una url
const runReg = async function(app){
  //obtener las contraseñas en la api
  app.post("/getRegs", async (req, res, next) => {
      var resp = await getRegs(req.body);
      res.end(JSON.stringify({
      data: resp,
      msg:"get registers"
      }));
  });
  app.post("/getActiveRegs", async (req, res, next) => {
    var resp = await getActiveRegs(req.body);
    res.end(JSON.stringify({
    data: resp,
    msg:"get active registers"
    }));
  });
  app.post("/getBinRegs", async (req, res, next) => {
    var resp = await getBinRegs(req.body);
    res.end(JSON.stringify({
    data: resp,
    msg:"get registers in the bin"
    }));
  });
  app.post("/setReg", async (req, res, next) => {
    var resp = await setReg(req.body);
    res.end(JSON.stringify({
    data: resp,
    msg:"new register"
    }));
  });
  app.post("/delReg", async (req, res, next) => {
    var resp = await delReg(req.body);
    res.end(JSON.stringify(resp))
  });
}

//exportar el main
export default runReg;

