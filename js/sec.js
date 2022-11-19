import { AES } from "crypto-js";

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

const runSec = async function(app){
    console.log("seguridad uwu")
    //test
    app.get("/generateKeys", async (req, res, next) => {
        const publicKey = generateKeys();
        res.json({
            data: publicKey,
            msg:"generated"});
    });
}

//exportar el main
export default runSec;

//rsa

import fs from 'fs'
import crypto from 'crypto'

const generateKeys = function (){
    const {publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 2048,
    })
    console.log("keys changed")
    return publicKey
}

export function encryptText (plainText) {
  return crypto.publicEncrypt({
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  // We convert the data string to a buffer
  Buffer.from(plainText)
  )
}

export function decryptText (encryptedText) {
  return crypto.privateDecrypt(
    {
      key: fs.readFileSync('private_key.pem', 'utf8'),
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    encryptedText
  )
}