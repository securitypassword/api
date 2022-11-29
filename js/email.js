import * as emailjs from "@emailjs/browser";
import {XMLHttpRequest} from "xmlhttprequest"
import axios from "axios";

const sendEmail = async function(to, subject, content){
    console.log("send email",to,subject,content)
    const data = {
        //service_id: process.env.EMAIL_SERVICE_ID,
        //template_id: process.env.EMAIL_TEMPLATE_ID,
        //user_id: process.env.EMAIL_PUBLIC_KEY,
        //template_params: {subject:subject, content:content, to:to}
    };
    const resp = await axios.post('https://api.emailjs.com/api/v1.0/email/send',
        JSON.stringify(data),
        {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        }
    );
    console.log("axios",resp)
}


//el main para que se pueda ejecutar desde una url
const runEmail = async function(app){
    emailjs.init(process.env.EMAIL_PUBLIC_KEY)
    //await sendEmail("martin.sainos.demian@gmail.com","test","running")
    app.get("/test", async (req, res, next) => {
        await sendEmail("martin.sainos.demian@gmail.com","test",req.query.text)
        res.json({
            msg:"email"
        });
    });
}

//exportar el main
export default runEmail;