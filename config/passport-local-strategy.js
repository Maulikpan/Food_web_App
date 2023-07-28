const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
// Authentication using Passport.js local strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passReqToCallback: true
}, function (req, email, done) {
  const otp = req.body.OTP; // Assuming the OTP is sent in the request body
  console.log('called 1');
  User.findOne({ email: email })
  .then((user) => {
    if (!user) {
      console.log('called 2');
      return done(null, false);
    }
    else
    {
      console.log('called 3');
      return done(null, user);
    } 
  })
  .catch((err) => {
    console.log('Error in finding user:', err);
    req.flash('error', err);
    console.log('called 4');
      return done(err);
    });
}));

 passport.serializeUser(function(user,done)
{
  console.log(user);
  return done(null,user.id);
});

passport.deserializeUser(function(id,done)
{
    User.findById(id)
      .then((user)=>{
        return done(null,user);
      })
        .catch((err)=>
        {
            console.log('error in finding user -->passport');
            return done(err);
        })
})
passport.checkAuthentication=function(req,res,next){
  console.log('checkauthentication called')
  if(req.isAuthenticated()){
    console.log('called authen');
    return next();
  }
  //if the user is not signed in 
  return res.redirect('/users/sign-in');  
}
passport.setAuthenticatedUser=function(req,res,next){
  if(req.isAuthenticated()){
    console.log('user caught',req.user);
    res.locals.user=req.user;
    res.locals.usersProfileUrl=req.url; //new feature don't mind
  }
  next(); 
}
module.exports=passport; 
