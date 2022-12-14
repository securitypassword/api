import express from "express";
import runUser from "./js/db/user.js"
import runFree from "./js/free.js"
import runSec from "./js/sec.js";
import runReg from "./js/db/reg.js";
import runUserConfig from "./js/db/userConfig.js"
import runEmail from "./js/email.js";
import runAsk from "./js/db/ask.js";
import bodyParser from "body-parser";
import cors from 'cors';
var app = express();
 //get PORT from the server
 //obtener el PUERTO del server donde hosteamos
const PORT = process.env.PORT;

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//global
//que si no da error
const corsConfig = {
    credentials: true,
    origin: true,
};
app.use(cors(corsConfig));
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
