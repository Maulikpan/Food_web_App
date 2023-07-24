const User = require('../models/user');
const passport = require('../config/passport-local-strategy');
const fs = require('fs');  //to deal with file system
const path = require('path');
const queue = require('../config/kue');
const otpGenerator = require('otp-generator');
const { send } = require('process');
const OTPEmailWorker = require('../workers/OTP_email_worker');
const otpmailer = require('../mailers/OTP_mailer')
var Outer_OTP;
var UserName='';
function settinUserName(userName)
{ 
  UserName = userName;
}
var sendOTP = function (userName,req) {
    var OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false ,lowerCaseAlphabets:false});
    Outer_OTP=OTP;
    const jobData = {
        name: userName,
        OTP: OTP
    };
    console.log(jobData);
    let job = queue.create('emails', jobData).save(function (err) {
        if (err) {
            console.log('Error in creating a queue and sending comment to queue', err);
            return;
        }
        console.log('Job enqueued:', job.id);
    });
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
        return res.redirect('/users/profile');
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
                User.create(req.body)
                    .then((user) => {
                        console.log('New user added successfully!', user);
                        settinUserName(user.name);
                        req.flash('message_otp', `OTP succesfully send ${req.body.email} over this email`);
                        sendOTP(user.name,req);
                        return res.render('otp', { title: 'OTP | Varify' });
                    })
                    .catch((err) => {
                        console.log('Error in creating a user:', err);
                        return res.redirect('back');
                    });
            } else {
                console.log('User already exists with the same credentials');
                req.flash('error','User already exists!')
                res.redirect('back');
            }
        })
        .catch((error) => {
            console.error('An error occurred in finding a user:', error);
            return res.redirect('back');
        });

}
module.exports.createSession = function (req, res) {
    req.flash('success', 'Logged in successfuly');
    return res.redirect('/');
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
module.exports.otpVarification = function (req, res) {
    console.log(req.body);
    if (Outer_OTP == req.body.OTP) {
        req.flash('success', 'User succesfully logged in!!');
        return res.render('home',  {title: "Home | Page" })
    }
    else {
        req.flash('error', 'Error in login or invalid OTP');
    }
}
module.exports.resendOtp = function (req, res) {
    sendOTP(UserName,req);
}   