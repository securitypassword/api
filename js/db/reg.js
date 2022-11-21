//import { collection, doc, setDoc, getDocs } from "firebase-admin/firestore";
import db from "../fire.js"
const reg = db.collection("reg");



//el main para que se pueda ejecutar desde una url
const runReg = async function(app){
  //obtener los roles en la api con un get porque me da flojera hacer las pruebas bien haha salu3
  app.post("/getRegs", async (req, res, next) => {
      var resp = await getRegs();
      res.json({
      data: resp,
      msg:"registers"
      });
  });
}

//exportar el main
export default runReg;

