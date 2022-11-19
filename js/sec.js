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
  const keys = await getKeys();
  if(keys==[]){
    createFile(pathPublic);
    createFile(pathPrivate);
    generateKeys();
  }
  console.log("seguridad uwu")
  //generar
  app.post("/generateKeys", async (req, res, next) => {
    const publicKey = await generateKeysAdmin(req.body);
    res.send({
      data: publicKey,
      msg:"generated"});
  });
  //cifrar con la llave publica
  app.get("/encode", async (req, res, next) => {
    const text = decodeURI(req.query.text)
    const resp = encryptTextPublic(text);
    res.json({
      data: resp,
      msg:"generated"});
  });
}

//exportar el main
export default runSec;

//rsa

import fs from 'fs'
import crypto from 'crypto'
import db from "./fire.js"
const keys = db.collection("keys");

const getKeys = async function(){
    //obtener la coleccion de llaves
    const keySnapshot = await key.get().then((querySnapshot) => {
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
const setKey = async function (keyName, value){
  let set = await keys.doc(keyName).update({
    name:keyName,
    value: value})
  console.log("set",keyName)
  console.log(set)
}

const generateKeys = async function (){
    const {publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 2048,
    })
    const publicKeyTxt = await crypto.subtle.exportKey('pkcs8', publicKey)
    const privateKeyTxt = await crypto.subtle.exportKey('pkcs8', privateKey)
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
  let resp = ''
  if(body.ley == masterKey){
    resp = await generateKeys();
  }else{
    console.log("some fellow is tryin to change the keys")
    resp = "nope"
  }
  return resp;
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
export function encryptTextPublic (plainText) {
  return encryptTextKey(plainText, fs.readFileSync(pathPublic, 'utf8'))
}
export function encryptTextPrivate (plainText) {
  return encryptTextKey(plainText, fs.readFileSync(pathPrivate, 'utf8'))
}

export function decryptTextKey (encryptedText) {
  return crypto.privateDecrypt(
    {
      key: fs.readFileSync(pathPrivate, 'utf8'),
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    encryptedText
  )
}
export function decryptTextPublic (encryptedText) {
  return decryptTextKey(encryptedText, fs.readFileSync(pathPublic, 'utf8'))
}
export function decryptTextPrivate (encryptedText) {
  return decryptTextKey(encryptedText, fs.readFileSync(pathPrivate, 'utf8'))
}