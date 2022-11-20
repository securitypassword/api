export const gen = async function(query){
    var allowed = "";
    if (query.low == "true") {
      allowed += "abcdefghijklmnopqrstuvwxyz";
    }
    if (query.up == "true") {
      allowed += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (query.n == "true") {
      if (req.query.low == "true") {
        allowed += "ñæç";
      }
      if (query.up == "true") {
        allowed += "ÑÆÇ";
      }
      allowed += "";
    }
    if (query.num == "true") {
      allowed += "1234567890";
    }
    if (query.char == "true") {
      allowed += "!#$%&/()=?*";
    }
    //funeral vikingo
    /*
                      ||\\\
                      ||\\\\\
                      ||\/*\\\
                      ||\\\\\\\
                      ||
                      ||
          /*\         ||          /*\     /*\     /*\
    \\\\  if (req.query.rect == "true") {       \\\\\\
      \\\\\\  allowed += "■▀▄█▓▒░";}  /*\  \\\\\\\\\
          \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    */
    var len = parseInt(query.len);
    var pass = "";
  
    for (var i = 0; i < len; i++) {
      pass += allowed.charAt(Math.floor(Math.random() * allowed.length));
    }
    return pass;
}

//el main para que se pueda ejecutar desde una url
const runFree = function(app){
    app.get("/generate", async (req, res, next) => {
        var resp = await gen(req.query);
        res.json({
        data: resp,
        msg:"generate password"
        });
    });
}

//exportar el main
export default runFree;