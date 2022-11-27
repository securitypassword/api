//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
import * as sec from "../sec.js"
const rol = db.collection("rol");
const user = db.collection("user");


const autoDel = async function(query){
    let resp = {data:'error', msg:''}
    if(body.name != undefined ){
        if(body.password != undefined){
          const exists = await userExists(body.name)
          if(exists){
            const logintokenhere = await loginToken(body)
            if(logintokenhere.msg!=undefined&&logintokenhere.msg!=""){
              if(logintokenhere.msg=="found"){
                if(logintokenhere.data!=undefined&&logintokenhere.data!=""){
                  console.log("auto delete setting for",sec.from64(logintokenhere.data))
                  const userquery = await user.doc(logintokenhere.data).get()
                  const userdata = userquery.data()
                  console.log("uwu", userdata)
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

//el main para que se pueda ejecutar desde una url
const runUserConfig = async function(app){
    app.post("/autoDel",async (req, res, next) => {
        const reg = await autoDel(req.body)
        const resp = reg
        res.end(JSON.stringify(resp));
      })
}

//exportar el main
export default runUserConfig;