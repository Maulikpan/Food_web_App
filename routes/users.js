const express = require('express');
const passLocal = require('passport-local');
const passportLocalStrategy = require('../config/passport-local-strategy');
const passport = require('passport');
// const passportLocalStrategy = require('passport-local');
const router = express.Router();
const usersControllers = require('../controllers/users_controller')
router.get('/profile', passport.checkAuthentication, usersControllers.profile);
router.get('/updateUserProfile', passport.checkAuthentication, usersControllers.update);
router.post('/updatingUserProfile', passport.checkAuthentication, usersControllers.updateUserDb);
router.get('/sign-up', usersControllers.signUp);
router.get('/sign-in', usersControllers.signIn);
router.post('/createUser', usersControllers.create);
router.post('/signup-otp-varification', usersControllers.otpVarification_For_SignUp);
router.post('/sign-in-otpvarification', passport.authenticate(
    'local',
    { failureRedirect: '/users/sign-in' },
), usersControllers.otpVarification_For_SignIn);
router.post('/sign-up_resend-Otp', usersControllers.resendOtp_SignUp);
router.post('/resend-Otp-For-UpdateEmail', usersControllers.resendOtp_For_updateEmail)
router.post('/otp-varification', usersControllers.sending_Sign_In_OTP);
router.post('/sign-in_resend-Otp', usersControllers.resendOtp_SignIn);
router.post('/UpdateEmailOTP', usersControllers.updateEmailOTP);
router.get('/sign-out', usersControllers.destroySession);
module.exports = router;      