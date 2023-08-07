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
      if (!user || user.password !== password) {
        req.flash('error', 'Invalid Username/Password');
        return done(null, false);
      }
      console.log('are wah',user);
      return done(null, user);
    })
    .catch((err) => {
      req.flash('error', err);
      return done(err);
    });
}));

// Serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserializing the user from the key in the cookies
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

// Check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
  // If the user is signed in, then pass on the request to the next function(controller's action)
  if (req.isAuthenticated()) {
    return next();
  }
  // If the user is not signed in
  return res.redirect('/users/sign-in');
};

// Set authenticated user to locals for views
passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    // req.user contains the current signed-in user from the session cookie and we are just sending this to the locals for the views
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
