const queue = require('../config/kue');
const  otp_mailer=require('../mailers/OTP_mailer');

queue.process('emails',function(job,done){
    console.log('OTP',job.data);
    otp_mailer.OTPs(job.data); 
   console.log();
   console
    done(); 
});
queue.process('emails_sign_in',function(job,done)
{
    console.log('OTP',job.data);
    otp_mailer.Sign_in_OTPs(job.data); 
   console.log();
   console
    done(); 
})