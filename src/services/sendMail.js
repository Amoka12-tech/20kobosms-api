import env from 'dotenv';
env.config();
const nodemailer = require("nodemailer");


const sendMailMessage = async (user, subject, output) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
        }
    });

    let mailOptions = {
        from: `${process.env.GMAIL_USER}`,
        to: user,
        subject: subject,
        html: output,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log("Didn't send");
            return console.log(error.message);
        }

        if(info) {
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    });
}

export default sendMailMessage;