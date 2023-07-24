const Mail = require('nodemailer/lib/mailer');
const nodeMailer = require('../config/nodemailer');
exports.OTPs = (OTP) => {
  console.log(OTP);
  let htmlString = nodeMailer.renderTemplete({ OTP: OTP }, '/OTP/OTP.ejs');
  nodeMailer.transpoter.sendMail({
    from: 'easywayforweb@gmail.com',
    to: 'maulikpanchal1811@gmail.com',
    subject: 'one time password (OTP) For signUp',
    html: htmlString
  }, (err, info) => {
    if (err) {
      console.log('Error in sending mail', err);
      return;
    }
    console.log('Message sent', info);
    return;
  });
};
