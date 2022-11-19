import AES from "crypto-js/aes";

const key = "i forgor :skull:"

//decrypt
export const dec = function (text) {
    return AES.decrypt(
        text.replace(/-/g, "+").replace(/_/g, "/"),
        key
    ).toString(CryptoJS.enc.Utf8);
};
//encrypt
export const enc = function (text) {
    return AES.encrypt(text, key)
        .toString()
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

//definir la ruta de las llaves
const pathPublic = './public_key.pem';
const pathPrivate = './private_key.pem';

//main
const runSec = async function(app){
  //generar llaves si no existen
  if((!fs.existsSync(pathPublic))||(!fs.existsSync(pathPrivate))){
    createFile(pathPublic);
    createFile(pathPrivate);
    generateKeys();
  }
  console.log("seguridad uwu")
  //generar
  app.post("/generateKeys", async (req, res, next) => {
    const publicKey = generateKeysAdmin(req.body);
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

//crear archivo exista o no
const createFile = function(fileName){
  fs.writeFile(fileName, {flag: 'wx'}, function (err, data) 
            { 
                callback();
            })
}

const generateKeys = function (){
    const {publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 2048,
    })
    fs.writeFileSync(pathPrivate, privateKey, 'utf8')
    fs.writeFileSync(pathPublic, publicKey, 'utf8')
    console.log("keys changed")
    console.log("private")
    console.log(privateKey)
    console.log("public")
    console.log(publicKey)
    return pathPublic
}

//cambiar las llaves desde el modo admin
const generateKeysAdmin = function(body){
  let resp = ''
  if(body.ley == key){
    resp = generateKeys();
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