const nodemMailer=require("nodemailer")
const sendEmail=async (options)=>{
    console.log(options)
 const transporter=nodemMailer.createTransport({
   host: 'smtp.gmail.com',
   port: 465,
   // secure: false,
    service:process.env.SMPT_SERVICE,
    auth:{
        user:process.env.SMPT_MAIL,
        pass:process.env.SMPT_PASSWORD
    }
 })
 const mailOptions={
    from:process.env.SMPT_MAIL,
    to:options.email,
    subject:options.subject,
    text:options.message
 }
await transporter.sendMail(mailOptions)

}
module.exports=sendEmail