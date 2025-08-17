const mailer = require('nodemailer')

const sendingMail = async(to,subject,text) =>{
   
    const transporter = mailer.createTransport({
        service:'gmail',
        auth:{
            user:"Astroanekant@gmail.com",
            pass:"poeegtxvocmjfbom"
        }
    })

    const mailOptions = {
        from: "Astroanekant@gmail.com",
        to: to,
        subject: subject,
        html:`<h1>${text}</h1>`
      };
    

    const response = await transporter.sendMail(mailOptions);
    return response;


}
module.exports={sendingMail}