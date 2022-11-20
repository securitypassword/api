import AES from "crypto-js/aes.js";

const masterKey = "i forgor :skull:"

//decrypt
export const dec = function (text) {
    return AES.decrypt(
        text.replace(/-/g, "+").replace(/_/g, "/"),
        masterKey
    ).toString(CryptoJS.enc.Utf8);
};
//encrypt
export const enc = function (text) {
    return AES.encrypt(text, masterKey)
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
  //cifrar con la llave publica
  app.get("/encode", async (req, res, next) => {
    const text = decodeURI(req.query.text)
    const resp = await encryptTextPublic(text);
    res.json({
      data: resp,
      msg:"generated"});
  });
}

//exportar el main
export default runSec;

//rsa

import crypto from 'crypto'
import db from "./fire.js"
import { get } from "https";
const keys = db.collection("key");

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
  const publicIn = await keys.doc("public").get()
  const resp = ""
  if(publicIn != undefined)
    resp = await crypto.subtle.importKey('pkcs8', publicIn)
  return resp
}
const getPrivate = async function(){
  const privateIn = await keys.doc("private").get()
  const resp = ""
  if(privateIn != undefined)
    resp = await crypto.subtle.importKey('pkcs8', privateIn)
  return resp
}


const setKey = async function (keyName, value){
  let set = await keys.doc(keyName).update({
    name:keyName,
    value: value})
  console.log("set",keyName)
  console.log(set)
}

import window from "window"

const generateKeys = async function (){
    const keyPair = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 2048,
    })
    const publicKey = keyPair.publicKey
    const privateKey = keyPair.privateKey
    const cryptoSubtle = window.crypto.subtle
    const publicKeyTxt = await cryptoSubtle.exportKey('pkcs8', publicKey)
    const privateKeyTxt = await cryptoSubtle.exportKey('pkcs8', privateKey)
    await setKey('public',publicKeyTxt)
    await setKey('private',privateKeyTxt)
    console.log("keys changed")
    console.log("private")
    console.log(publicKeyTxt)
    console.log("public")
    console.log(privateKeyTxt)
    return publicKeyTxt
}

//cambiar las llaves desde el modo admin
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
  return crypto.privateDecrypt(
    {
      key: thisKey,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    encryptedText
  )
}
export async function decryptTextPublic (encryptedText) {
  return decryptTextKey(encryptedText, await getPublic())
}
export async function decryptTextPrivate (encryptedText) {
  return decryptTextKey(encryptedText, await getPrivate())
}