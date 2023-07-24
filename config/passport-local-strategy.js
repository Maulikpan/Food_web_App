const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

// Authentication using Passport.js local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
},
    function (req, email, password, done) {
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    return done(null, false);
                }

                bcrypt.compare(password, user.password)
                    .then((isMatch) => {
                        if (!isMatch) {
                            console.log('Invalid username/password');
                            req.flash('error', 'Invalid Username or password');
                            return done(null, false);
                        }

                        return done(null, user);
                    })
                    .catch((err) => {
                        console.error('Error in comparing passwords:', err);
                        return done(err);
                    });
            })
            .catch((err) => {
                console.log('Error in finding user:', err);
                req.flash('error', err);
                return done(err);
            });
    }
));
 passport.serializeUser(function(user,done)
{
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
