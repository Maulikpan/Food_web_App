const Mail = require('nodemailer/lib/mailer');
const nodeMailer = require('../config/nodemailer');
exports.OTPs = (OTP) => {
  let htmlString = nodeMailer.renderTemplete({ OTP: OTP }, '/OTP/OTP.ejs');
  nodeMailer.transpoter.sendMail({
    from: 'easywayforweb@gmail.com',
    to: OTP.email,
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

exports.Sign_in_OTPs= (OTP) => {
  let htmlString = nodeMailer.renderTemplete({ OTP: OTP }, '/OTP/sign_in_otp.ejs');
  nodeMailer.transpoter.sendMail({
    from: 'easywayforweb@gmail.com',
    to:  OTP.email,
    subject: 'one time password (OTP) For signIn',
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