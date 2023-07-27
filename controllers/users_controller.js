const User = require('../models/user');
const passportLocal = require('../config/passport-local-strategy');
const passport = require('passport');
const fs = require('fs');  //to deal with file system
const path = require('path');
const queue = require('../config/kue');
const otpGenerator = require('otp-generator');
const { send } = require('process');
const OTPEmailWorker = require('../workers/OTP_email_worker');
const otpmailer = require('../mailers/OTP_mailer');
const axios = require('axios');
var Outer_Access_SignUp_OTP;
var Outer_Access_SignIn_OTP;
var userNameSignUp;
var userEmailSignUp;
var userNameSignIn;
var userEmailSignIn;
function settinUserDetailForSignUpResendOtp(userName,userEmail)
{ 
  userNameSignUp = userName;
  userEmailSignUp = userEmail;
}
function settinUserDetailForSignInResendOtp(userName,userEmail)
{
    userNameSignIn = userName;
    userEmailSignIn = userEmail;
}
var send_Sign_In_OTP = function(userName,userEmail,req)
{
    var OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false ,lowerCaseAlphabets:false});
    Outer_Access_SignIn_OTP=OTP;
    const jobData = {
        name:userName,
        OTP: OTP,
        email:userEmail
    };
    console.log(jobData);
    // creating job to send emails
    // let job = queue.create('emails_sign_in', jobData).save(function (err) {
    //     if (err) {
    //         console.log('Error in creating a queue and sending comment to queue', err);
    //         return;
    //     }
    //     console.log('Job enqueued:', job.id);
    // });
}
var send_Sign_Up_OTP = function (userName,userEmail,req) {
    var OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false ,lowerCaseAlphabets:false});
    Outer_Access_SignUp_OTP=OTP;
    const jobData = {
        name: userName,
        OTP: OTP,
        email:userEmail
    };
    console.log('jobdata',jobData);
    //creating job to send emails
//     let job = queue.create('emails', jobData).save(function (err) {
//         if (err) {
//             console.log('Error in creating a queue and sending comment to queue', err);
//             return;
//         }
//         console.log('Job enqueued:', job.id);
//     });
}
module.exports.profile = function (req, res) {
    {
        return res.render('user_profile', { title: 'User profile', user: res.locals.user })
    }
}
module.exports.update = async function (req, res) {
    if (req.user.id == req.params.id)   //for security purpose
    {
        try {
            let user = await User.findById(req.params.id);
            console.log(req.body);
            console.log(req.body);
            user.name = req.body.name;
            user.email = req.body.email;
            return res.redirect('back');
        }
        catch (error) {
            req.flash('error', error)
            return res.redirect('back');
        }
    }
    else {
        req.flash('error', 'Unauthorized');
        return res.status(401).send('Unauthorized');
    }
}
module.exports.signUp = function (req, res) {
    return res.render('user_sign_up', {
        title: 'FOOD-ADDA | sign Up'
    })
}
//render signin page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/users/sign-up');
    }
    return res.render('user_sign_in', {
        title: 'FOOD-ADDA | sign In'
    })
}
module.exports.create = function (req, res) {
    console.log(req.body);
    const query = { email: req.body.email };
    User.findOne(query)
        .then((user) => {
            if (!user) {
                        settinUserDetailForSignUpResendOtp(req.body.name,req.body.email);
                        send_Sign_Up_OTP(req.body.name,req.body.email,req);
                        return res.render('Sign_up_otp', { title: 'OTP | Varify' });
            } else {
                console.log('User already exists with the same credentials');
                req.flash('error','User already exists with same email id choose different one')
                res.redirect('/users/sign-up');
            }
        })
        .catch((error) => {
            console.error('An error occurred in finding a user:', error);
            return res.redirect('back');
        });

}

module.exports.sending_Sign_In_OTP = function(req,res)
{
     User.findOne({email:req.body.email})
     .then((user)=>{
         send_Sign_In_OTP(user.name,user.email,req);
         settinUserDetailForSignInResendOtp(user.name,user.email,req);
         return res.render('Sign_in_otp',{title:'OTP | Varify'})
     })
     .catch((err)=>{
        console.log('error',err)
     })
}

module.exports.createSession = function (req, res) {
    req.flash('success', 'Logged in successfuly OP');
}
module.exports.destroySession = function (req, res) {
    console.log(res.locals.flash);
    req.logout(function (err) {
        //logout function  remove the cookie from browser to remove the user identity
        if (err) {
            // Handle error
            console.error(err);
            return;
        }
        req.flash('success', ' You have signed Out');
        res.redirect('/');
    });
}
module.exports.logOut = async function (req, res) {
    return res.json({
        data: "succesfully deleted user account!"
    })
}
module.exports.otpVarification_For_SignUp = function (req, res) {
    console.log(req.body);
    if (Outer_Access_SignUp_OTP == req.body.OTP) {
        User.create({
            name:UserName,
            email:UserEmail,
            isValid:true
        })
                    .then((user) => {
                        console.log('New user added successfully!', user);
                        req.flash('success','sign up successfully completed')
                        return res.redirect('/users/sign-in');
                    })
                    .catch((err) => {
                        console.log('Error in creating a user:', err);
                        return res.redirect('/users/sign-up');
                    });
    }
    else {
        req.flash('error', 'Error in login or invalid OTP');
        return res.redirect('/users/sign-up');
    }
}
module.exports.resendOtp_SignUp= function (req, res) {
    send_Sign_Up_OTP(userNameSignUp,userEmailSignUp,req);
}   
module.exports.resendOtp_SignIn = function(req,res)
{
    send_Sign_In_OTP(userNameSignIn,userEmailSignIn,req);
}
module.exports.otpVarification_For_SignIn = function (req, res) {
    if (Outer_Access_SignIn_OTP == req.body.OTP) {
      req.body.email = userEmailSignIn;
      req.flash('error', 'Error in login or invalid OTP');
      
      // Call passport.authenticate with custom callback function
      passport.authenticate('local', { failureRedirect: '/users/sign-in' }, function (err, user, info) {
        if (err) {
          // Handle error
          console.error(err);
          return;
        }
  
        if (!user) {
          // If authentication fails, redirect to the sign-in page
          return res.redirect('/users/sign-in');
        }
  
        // If authentication is successful, log the user in
        req.logIn(user, function (err) {
          if (err) {
            // Handle login error
            console.error('Error in login:', err);
            return;
          }
  
          req.flash('success', 'You signed in successfully!');
          return res.redirect('/users/profile');
        });
      })(req, res); // Call the authenticate function with req and res.
    }
  };
  
