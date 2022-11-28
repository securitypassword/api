import * as emailjs from "@emailjs/browser"

const sendEmail = async function(subject, content, to){
    await emailjs.send(process.env.EMAIL_SERVICE_ID, process.env.EMAIL_TEMPLATE_ID, {
        subject:subject, content:content, to:to})
        .then(function(response) {
           console.log('SUCCESS!', response.status, response.text);
        }, function(error) {
           console.log('FAILED...', error);
        });
}

//el main para que se pueda ejecutar desde una url
const runEmail = async function(app){
    emailjs.init(process.env.EMAIL_PUBLIC_KEY)
    await sendEmail("test","running")
}

//exportar el main
export default runEmail;