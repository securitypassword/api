import express from "express";
import runUser from "./js/db/user.js"
import runFree from "./js/free.js"
import runSec from "./js/sec.js";
import runReg from "./js/db/reg.js";
import runUserConfig from "./js/db/userConfig.js"
import runEmail from "./js/email.js";
import runAsk from "./js/db/ask.js";
import cors from 'cors';
var app = express();
 //get PORT from the server
 //obtener el PUERTO del server donde hosteamos
const PORT = process.env.PORT;
app.use(function (req, res, next) {
  if (req.hostname.startsWith("https://securitypassword.github.io/")) {
      res.setHeader('Access-Control-Allow-Origin', 'http://' + req.hostname)
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  }
  next()
})
//end of global

//ejecutar el main de user.js
await runUser(app);
runFree(app);
await runSec(app);
await runReg(app)
await runUserConfig(app)
await runEmail(app)
await runAsk(app)

//test
app.get("/", async (req, res, next) => {
  res.json({
    msg:"welcome >:3"
  });
});
  
//run this sheet
//que se ejecute la cosa esta
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});  
