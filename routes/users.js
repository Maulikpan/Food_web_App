const express = require('express');
const passport = require('passport');
const router = express.Router();
const usersControllers = require('../controllers/users_controller')
router.get('/profile', passport.checkAuthentication, usersControllers.profile);
router.post('/update/:id', passport.checkAuthentication, usersControllers.update);
router.get('/sign-up', usersControllers.signUp);
router.get('/sign-in', usersControllers.signIn);
router.post('/createUser', usersControllers.create);
router.post('/otp-varification',usersControllers.otpVarification);
router.post('/resend-Otp',usersControllers.resendOtp);
router.post('/create-session', passport.authenticate(
    'local',
    { failureRedirect: '/users/sign-in' },
), usersControllers.createSession);
router.get('/sign-out', usersControllers.destroySession);
router.get('/log-out', usersControllers.logOut);

module.exports = router;      