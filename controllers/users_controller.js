const User = require('../models/user');
const passLocal = require('passport-local');
const passportLocalStrategy = require('../config/passport-local-strategy');
const passport = require('passport');
const fs = require('fs');  //to deal with file system
const path = require('path');
const queue = require('../config/kue');
const otpGenerator = require('otp-generator');
const { send } = require('process');
const OTPEmailWorker = require('../workers/OTP_email_worker');
const otpmailer = require('../mailers/OTP_mailer');
const { log } = require('console');
var Outer_Access_SignUp_OTP;
var Outer_Access_SignIn_OTP;
var userNameSignUp;
var userEmailSignUp;
var userNameSignIn;
var userEmailSignIn;
var userEmailUpdateEmail;
var userNameUpdateEmail;
var Outer_Access_UpdateEmail_OTP;
function settinUserDetailForSignUpResendOtp(userName, userEmail) {
    userNameSignUp = userName;
    userEmailSignUp = userEmail;
}
function settinUserDetailForSignInResendOtp(userName, userEmail) {
    userNameSignIn = userName;
    userEmailSignIn = userEmail;
}
function settinUserDetailForUpdateEmailResendOtp(userName, userEmail) {
    userEmailUpdateEmail = userEmail;
    userNameUpdateEmail = userName;
}
var send_Update_Email_OTP = function (userName, userEmail, req) {
    var OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    Outer_Access_UpdateEmail_OTP = OTP;
    const jobData = {
        name: userName,
        OTP: OTP,
        email: userEmail
    };
    console.log(jobData);
}
var send_Sign_In_OTP = function (userName, userEmail, req) {
    var OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    Outer_Access_SignIn_OTP = OTP;
    const jobData = {
        name: userName,
        OTP: OTP,
        email: userEmail
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
var send_Sign_Up_OTP = function (userName, userEmail, req) {
    var OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    Outer_Access_SignUp_OTP = OTP;
    const jobData = {
        name: userName,
        OTP: OTP,
        email: userEmail,
    };
    console.log('jobdata', jobData);
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
    res.render('update_user_profile', { title: 'Update Profile', userName: res.locals.user.name, userEmail: res.locals.user.email })
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
                settinUserDetailForSignUpResendOtp(req.body.name, req.body.email);
                send_Sign_Up_OTP(req.body.name, req.body.email, req);
                return res.render('Sign_up_otp', { title: 'OTP | Varify' });
            } else {
                console.log('User already exists with the same credentials');
                req.flash('error', 'User already exists with same email id choose different one')
                res.redirect('/users/sign-up');
            }
        })
        .catch((error) => {
            console.error('An error occurred in finding a user:', error);
            return res.redirect('back');
        });

}

module.exports.sending_Sign_In_OTP = function (req, res) {
    User.findOne({ email: req.body.email })
        .then((user) => {
            send_Sign_In_OTP(user.name, user.email, req);
            settinUserDetailForSignInResendOtp(user.name, user.email, req);
            return res.render('Sign_in_otp', { title: 'OTP | Varify', email: user.email })
        })
        .catch((err) => {
            console.log('error in finding user', err);
            req.flash('error', 'Invalid email id');
            return res.redirect('/users/sign-in')
        })
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
module.exports.otpVarification_For_SignUp = function (req, res) {
    console.log(req.body);
    if (Outer_Access_SignUp_OTP == req.body.OTP) {
        User.create({
            name: userNameSignUp,
            email: userEmailSignUp,
            password: '123', //temp password for authentication
        })
            .then((user) => {
                console.log('New user added successfully!', user);
                req.flash('success', 'sign up successfully completed')
                return res.redirect('/users/sign-in');
            })
            .catch((err) => {
                console.log('Error in creating a user:', err);
                return res.redirect('/users/sign-up');
            });
    }
    else {
        req.flash('error', 'Error in login / invalid OTP');
        return res.redirect('/users/sign-up');
    }
}
module.exports.resendOtp_SignUp = function (req, res) {
    send_Sign_Up_OTP(userNameSignUp, userEmailSignUp, req);
}
module.exports.resendOtp_SignIn = function (req, res) {
    send_Sign_In_OTP(userNameSignIn, userEmailSignIn, req);
}
module.exports.otpVarification_For_SignIn = function (req, res) {
    console.log(req.body);
    if (Outer_Access_SignIn_OTP == req.body.OTP) {
        req.flash('success', 'you sign-in successfully !');
        res.redirect('/users/profile');
    }
    else {
        req.flash('error', 'error in login / invalid OTP')
        req.logout(function (err) {
            if (err) {
                console.error(err, 'error in logout!');
                return;
            }
        })
        return res.redirect('/users/sign-in');
    }
}

module.exports.updateUserDb = function (req, res) {
    User.find({ $or: [{ email: req.body.email }, { name: req.body.name }] })
        .then((user) => {
            if (user) {
                if (user.email == req.body.email) {
                    req.flash('error', 'user already exists with same email ID!');
                    return res.redirect('/users/updateUserProfile');
                }
                else {
                    if (req.body.email) {
                        settinUserDetailForUpdateEmailResendOtp(req.body.name, req.body.email);
                        send_Update_Email_OTP(req.body.name, req.body.email, req);
                        return res.render('UpdateEmail_OTP', { title: 'OTP | Varify', userEmail: req.body.email, userName: req.body.name })
                    }
                    else {
                        User.findOne({ name: req.user.name })
                            .then((user) => {
                                user.name = req.body.name;
                                user.save();
                                req.flash('success', 'User profile updated successfully!');
                                return res.redirect('/users/profile');
                            })
                            .catch((err) => {
                                console.log(err);
                                req.flash('error', 'An error occurred while updating user profile.');
                                return res.redirect('/users/updateUserProfile');
                            })
                    }
                }
            }
        })
        .catch((err) => {
            console.log(err, 'Error');
            return res.redirect('/users/updateUserProfile')
        })
}
module.exports.updateEmailOTP = function (req, res) {
    if (Outer_Access_UpdateEmail_OTP == req.body.OTP) {
        User.findOne({ email: req.user.email })
            .then((user) => {
                if (req.body.name) {
                    user.name = req.body.name;
                }
                user.email = req.body.email;
                user.save();
                req.user = user;
                res.locals.user = user;
                req.flash('success', 'User profile Updated succesfully!')
                return res.redirect('/users/profile');
            })
            .catch((err) => {
                console.log(err, 'Error!');
            })
    }
}
module.exports.resendOtp_For_updateEmail = function (req, res) {
    send_Update_Email_OTP(userNameUpdateEmail, userEmailUpdateEmail, req);
}