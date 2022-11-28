import * as emailjs from "@emailjs/browser"

export const sendEmail = async function(to, subject, content){
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
    await sendEmail("martin.sainos.demian@gmail.com","test","running")
}

//exportar el main
export default runEmail;