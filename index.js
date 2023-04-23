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
var allowedOrigins = ['http://localhost:3000', 'http://securitypassword.github.io'
, 'http://securitypassword.github.io/#/', 'http://securitypassword.github.io/*'];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
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
