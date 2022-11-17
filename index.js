import express from "express";
import runUser from "./js/db/user.js"
var app = express();
 //get PORT from the server
const PORT = process.env.PORT;


//global
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
//end of global

runUser(app);


//test
app.get("/", async (req, res, next) => {
  res.json({msg:"welcome >:3"});});
  
//run this sheet
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});  