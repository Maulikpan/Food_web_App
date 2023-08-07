const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
// Authentication using Passport.js local strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passReqToCallback: true,
}, function (req, email, password, done) {
  User.findOne({ email: email })
  .then((user) =>
    {
      if (!user || user.password !== password || !req.body.OTP)
       {
        req.flash('error', 'Invalid Username or OTP');
        console.log('uggh kya kar raha hai bhai! otp enter kar');
        return done(null, false);
      }
      return done(null, user);
    })
    .catch((err) => {
      req.flash('error', err);
      return done(err);
    });
}));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then((user) => {
      return done(null, user);
    })
    .catch((err) => {
      console.log('Error in finding user --> Passport');
      return done(err);
    });
});

passport.checkAuthentication = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/users/sign-in');
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
