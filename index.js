const express = require("express");
var app = express();

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

//test
app.get("/", async (req, res, next) => {
    res.json({msg:"welcome >:3"});});
  
  //run this sheet
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });  