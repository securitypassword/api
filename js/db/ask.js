import db from "../fire.js"
import * as sec from "../sec.js"
import { userExists } from "./user.js";
import { incCountRegs } from "./reg.js";
import { sendEmail } from "../email.js";
const user = db.collection("user");


const setAsk = async function(body){
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
      if(body.question == undefined || body.question == ""){
        resp.msg = "please introduce question"
      }else{
        if(body.answer == undefined || body.answer == ""){
          resp.msg = "please introduce the answer"
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
                    await user.doc(username).update({
                        usu_has_question:true,
                        usu_question:sec.enc(body.question),
                        usu_answer: sec.sha(body.answer)})
                        }
                    }
                }
            }
        }
    }
  
    return resp
  }
  
  
const askChange = async function(body){
    let resp = {data:'error', msg:''}
    
    if(body!=undefined){
        if(body.token!=null&&body.token!=""&&body.token!=undefined){
            const gettoken = await sec.getToken(body.token)
            if(JSON.stringify(gettoken) != "{}"){
                console.log("token value", gettoken)
                const username = gettoken.data
                console.log("from",sec.from64(username))
                const userquery = await user.doc(username).get().then((querySnapshot) => {
                  return querySnapshot
                })
                const userdata = userquery.data()
                await user.doc(username).update({usu_has_question: !userdata.usu_has_question})
                resp.data = 'success'
                resp.msg = !userdata.usu_has_question
            }
        }
    }
    return resp
}

const getAsk = async function(body){
    let resp = {data:'error', msg:''}
    
    if(body!=undefined){
        if(body.token!=null&&body.token!=""&&body.token!=undefined){
            const gettoken = await sec.getToken(body.token)
            console.log("uwu")
            if(JSON.stringify(gettoken) != "{}"){
                console.log("token value", gettoken)
                const username = gettoken.data
                console.log("from",sec.from64(username))
                const userquery = await user.doc(username).get().then((querySnapshot) => {
                  return querySnapshot
                })
                const userdata = userquery.data()
                resp.data = 'success'
                resp.msg = userdata.usu_has_question
            }
        }
    }
    return resp
}

const forgorPassword = async (body) => {
    let resp = {data:'error', msg:''}
    if(body == undefined || body == ""){
        resp.msg = "please introduce data"
    }else{
        if(body.name == undefined || body.name == ""){
            resp.msg = "please introduce name"
        }else{
            const exists = await userExists(body.name)
            if(!exists){
                resp.msg = "invalid name"
            }else{
                const userquery = await user.doc(sec.to64(body.name)).get().then((querySnapshot) => {
                    return querySnapshot
                })
                resp.valid= true
                resp.msg = "forgor password"
                resp.data = userquery.id
                const token = await sec.signToken(resp)
                let msg = "some fellow is tryin to change yhe password, if it was you please go to"
                msg += " " + process.env.FRONT_URL + "/#/changePassword/"+token
                msg += " to change þē password"
                await sendEmail(sec.from64(userquery.data().usu_email),"change password",msg)
            }
        }
    }
    return resp
}

const forgorPasswordToken = async function(body){
    console.log("login token")
    console.log(body.token)
    let resp = {
      data: "",
      msg: "not found"}
    if(body.token != undefined){
        if(body.password != undefined && body.password != ""){
            const gettoken = await sec.getToken(body.token)
            if(JSON.stringify(gettoken) != "{}"){
                console.log("token value", gettoken)
                const username = gettoken.data
                //comprobar si es admin
                if(await userExists(sec.from64(username))){
                const userquery = await user.doc(username).get().then((querySnapshot) => {
                    return querySnapshot
                })
                const userset = await user.doc(username).update({usu_password: sec.sha(body.password)})
                resp.msg = "found"
                resp.data = "success"
            }
        }
      }
    }
    return resp
  }
  
const cronii = async function(key){
    let resp = {
      data: "not",
      msg: "cronii"
    }
    const keys = await sec.getKeys();
    let publicKey = ""
    if(keys[1].id == "public"){
        publicKey = keys[1].value
    }
    publicKey = sec.hash(publicKey).substring(0, 15)
    console.log(publicKey)
    if(publicKey == key){
        resp.data = "yes"
        //hacer recurrentemente
        await sec.delTokensAdmin({key:process.env.MASTER_KEY})
        await incCountRegs()
    }
    console.log(key)
    console.log(publicKey)
    return resp
}

const runAsk = async function(app){
    app.post("/setAsk",async (req, res, next) => {
        const reg = await setAsk(req.body)
        const resp = reg
        res.end(JSON.stringify(resp));
    })
    app.post("/askChange",async (req, res, next) => {
        const reg = await askChange(req.body)
        const resp = reg
        res.end(JSON.stringify(resp));
    })
    app.post("/getAsk",async (req, res, next) => {
        const reg = await getAsk(req.body)
        const resp = reg
        res.end(JSON.stringify(resp));
    })
    app.post("/forgorPassword",async (req, res, next) => {
        const reg = await forgorPassword(req.body)
        const resp = reg
        res.end(JSON.stringify(resp));
    })
    app.post("/forgorPasswordToken",async (req, res, next) => {
        const reg = await forgorPasswordToken(req.body)
        const resp = reg
        res.end(JSON.stringify(resp));
    })
    app.get("/cronii",async (req, res, next) => {
        const reg = await cronii(req.query.key)
        const resp = reg
        res.end(JSON.stringify(resp));
    })
}

//exportar el main
export default runAsk;