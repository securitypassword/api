import CryptoJS from "crypto-js";
import cron from "node-cron"


cron.schedule('*/5 * * * *', async () => {
  await delTokensAdmin({key:process.env.MASTER_KEY})
});

//master bait here we gooooooo
const masterKey = process.env.MASTER_KEY

//decrypt
export const dec = function (text) {
    return CryptoJS.AES.decrypt(
        text.replace(/-/g, "+").replace(/_/g, "/"),
        masterKey
    ).toString(CryptoJS.enc.Utf8);
};
//encrypt
export const enc = function (text) {
    return CryptoJS.AES.encrypt(text, masterKey)
        .toString()
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

//main
const runSec = async function(app){
  //generar llaves si no existen
  app.post("/generate", async (req, res, next) => {
    const keysget = await getKeys();
    console.log("get keys")
    console.log(keysget)
    if(keysget.length==0){
      console.log("generate keys")
      await generateKeys();
    }
    console.log("seguridad uwu")
    const resp ={
      data: "publicKey",
      msg: "uwu" }
    res.end(JSON.stringify(resp));
  });
  //generar llaves a peticion y asi
  app.post("/generateKeys", async (req, res, next) => {
    console.log("generate keys attempt")
    console.log(req.body)
    const publicKey = await generateKeysAdmin(req.body);
    const resp ={
      data: publicKey,
      msg: "generated" }
    res.end(JSON.stringify(resp));
  });
  //borrar tokens
  app.post("/delTokens", async (req, res, next) => {
    console.log("delete all tokens attempt")
    console.log("body",req.body)
    const resp = await delTokensAdmin(req.body);
    res.end(JSON.stringify(resp));
  });
  //norrar tokens
  app.post("/delToken", async (req, res, next) => {
    console.log("delete a specific tokens attempt")
    console.log(req.body)
    const resp = await delToken(req.body);
    res.end(JSON.stringify(resp));
  });
  //cifrar con la llave publica
  app.get("/encode", async (req, res, next) => {
    const text = decodeURI(req.query.text)
    const resp = await encryptTextPublic(text);
    res.json({
      data: resp,
      msg:"generated"});
  });
  //generar tokens y asi
  app.get("/token", async (req, res, next) => {
    const yourKey = decodeURI(req.query.key)
    let resp = ""
    if(yourKey == masterKey){
      const generateToken = await signToken("test")
      resp = await setToken(generateToken)
    }
    res.json({
      data: resp,
      msg:"token"});
  });
}

//exportar el main
export default runSec;

//rsa

import crypto from "crypto";
import db from "./fire.js"
import jwt from 'jsonwebtoken';
const keys = db.collection("key");
const tokens = db.collection("token");

const getKeys = async function(){
    //obtener la coleccion de llaves
    const keySnapshot = await keys.get().then((querySnapshot) => {
      return querySnapshot
    })
    //crear una lista con los documentos
    const keyDocs = keySnapshot.docs.map(doc => doc.data());
    //las ids
    const keyIDs = keySnapshot.docs.map(doc => doc.id);
    //juntarlas
    const keyList = keyIDs.map( function(x, i){
      return {"id": x, "value": keyDocs[i].value}
    }, this);
    return keyList;
}
const getPublic = async function(){
  let publicIn = await keys.doc("public").get()
  publicIn = publicIn.data()
  console.log("get public key")
  console.log(publicIn)
  let resp = ""
  if(publicIn != undefined)
    resp = Buffer.from(publicIn.value)
  return resp
}
const getPrivate = async function(){
  let privateIn = await keys.doc("private").get()
  privateIn = privateIn.data()
  console.log("get private key")
  console.log(privateIn)
  let resp = ""
  if(privateIn != undefined)
    resp = Buffer.from(privateIn.value)
  return resp
}


const setKey = async function (keyName, value){
  let set = await keys.doc(keyName).set({
    name:keyName,
    value: value})
  console.log("set",keyName)
  console.log(set)
}

const generateKeys = async function (){
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      // The standard secure default length for RSA keys is 2048 bits
      modulusLength: 2048,
    });
    const publicKeyTxt = publicKey.export({
      type: "pkcs1",
      format: "pem",
    });
    const privateKeyTxt = privateKey.export({
      type: "pkcs1",
      format: "pem",
    });
    console.log("keys changed")
    console.log("private")
    console.log(publicKeyTxt)
    console.log("public")
    console.log(privateKeyTxt)
    await setKey("public", publicKeyTxt)
    await setKey("private", privateKeyTxt)
    return publicKeyTxt
}

//cambiar las llaves desde el modo admin
const delTokensAdmin = async function(body){
  let resp = {}
  try{
  if(body != void(0)){
    if(body.key != undefined){
      if(body.key == masterKey){
        const gettokkens = await tokens.get().then((querySnapshot) => {
          return querySnapshot
        })
        gettokkens.forEach((doc) =>{
          console.log("token",doc)
          console.log("id",doc.id)
          if(doc.data().tok_touched==true){
            tokens.doc(doc.id).delete()
          }else{
            tokens.doc(doc.id).update({tok_touched:true})
          }
        })
      }else{
        console.log("some fellow is tryin to delete the tokens")
        resp = "nope"
      }
    }
  }
  return resp;
  }catch(error){
    console.log(error)
    return {data: 'error', msg:error}
  }
}
//eliminar un token en especifico
const delToken = async function(body){
  console.log("delete a token")
  resp = {data:"error", msg:""}
  if(body == undefined || body == ""){
    resp.msg = "please introduce data"
  }else{
    if(body.token == undefined || body.token ==""){
      resp.msg = "please introduce token"
    }else{
      const gettoken = await tokens.doc(body.token).get().then((querySnapshot) => {
        return querySnapshot
      })
      if(gettoken.data()==undefined||gettoken.data()==""){
        resp.msg = "token no existe"
      }else{
        await tokens.doc(body.token).delete()
        console.log("delete", body.token)
      }
    }
  }
  return resp
}
const generateKeysAdmin = async function(body){
  let resp = ' '
  try{
  if(body != void(0)){
    if(body.key != undefined){
      if(body.key == masterKey){
        resp = await generateKeys();
      }else{
        console.log("some fellow is tryin to change the keys")
        resp = "nope"
      }
    }
  }
  return resp;
  }catch(error){
    console.log(error)
    return 'error'
  }
}


function encryptTextKey (plainText, thisKey) {
  return crypto.publicEncrypt({
    key: thisKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  // We convert the data string to a buffer
  Buffer.from(plainText)
  )
}
export async function encryptTextPublic (plainText) {
  return encryptTextKey(plainText, await getPublic())
}
export async function encryptTextPrivate (plainText) {
  return encryptTextKey(plainText, await getPrivate())
}

export async function decryptTextKey (encryptedText, thisKey) {
  console.log("decrypt",encryptedText)
  const bufferEncrypt =  Buffer.from(encryptedText, "base64")
  return crypto.privateDecrypt(
    {
      key: thisKey,
      passphrase: '',
      padding:crypto.constants.RSA_PKCS1_PADDING
    },
    bufferEncrypt,
  )
}
export async function decryptTextPublic (encryptedText) {
  return decryptTextKey(encryptedText, await getPublic())
}
export async function decryptTextPrivate (encryptedText) {
  return decryptTextKey(encryptedText, await getPrivate())
}

export const signToken= async function(toDo){
  
  const token = jwt.sign(
    toDo,
    await getPrivate(),
    {
      expiresIn: "1 day",
    }
  );
  /* jose.SignJWT({ id: CryptoJS.SHA3(toDo) }) // details to  encode in the token
      .setProtectedHeader({ alg: 'HS256' }) // algorithm
      .setIssuedAt()
      .setIssuer("Server") // issuer
      .setAudience("Client") // audience
      .setExpirationTime("2 hours") // token expiration time, e.g., "1 day"
      .sign(await getPrivate()); // secretKey generated from previous step
      */
  console.log(token); // log token to console
  await setToken(token)
  return token
}

export const getToken = async function(token){
  console.log("get token", token)
  const query = await tokens.where("tok_name", "==", token).get().then((querySnapshot) => {
    return querySnapshot
  })
  const tokenList = query.docs.map(doc => doc.data());
  let resp = {}
  const tokenGot = tokenList[0]
  console.log(tokenGot)
  if(tokenList.length!=0){
    resp = jwt.decode(tokenGot.tok_name)
  }
  if(token.Got!=undefined){
    if(tokenGot.tok_touched!=undefined){
      if(tokenGot.tok_touched==true){
        tokens.doc(tokenGot.tok_name).update({tok_touched:false})
      }
    }
  }
  console.log("result", resp)
  return resp
}

const setToken = async function (token){
  const datenow = new Date()
  let set = await tokens.doc(token).set({
    tok_name: token,
    tok_date: datenow.toString(),
    tok_touched : false
  })
  console.log("set new token")
  console.log(set)
}

export const sha = function(text){
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Base64url)
}

export const to64 = function(text){
  return btoa(text).replace(/\+/g, "-")
  .replace(/\//g, "_");
}
export const from64 = function(text){
  return atob(text.replace(/\+/g, "-")
  .replace(/\//g, "_"));
}