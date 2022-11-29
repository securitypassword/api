//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
import * as sec from "../sec.js"
const user = db.collection("user");


const autoDel = async function(body){
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
                await user.doc(username).update({usu_autodelete: !userdata.usu_autodelete})
                resp.data = 'success'
                resp.msg = !userdata.usu_autodelete
            }
        }
    }
    return resp
}

const getAutoDel = async function(body){
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
                resp.msg = userdata.usu_autodelete
            }
        }
    }
    return resp
}

const changePassword = async function(body){
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
                resp.msg = userdata.usu_autodelete
            }
        }
    }
    return resp
}

//el main para que se pueda ejecutar desde una url
const runUserConfig = async function(app){
    app.post("/autoDel",async (req, res, next) => {
        const reg = await autoDel(req.body)
        const resp = reg
        res.end(JSON.stringify(resp));
      })
    app.post("/getAutoDel",async (req, res, next) => {
        const reg = await getAutoDel(req.body)
        const resp = reg
        res.end(JSON.stringify(resp));
    })
}

//exportar el main
export default runUserConfig;