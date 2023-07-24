const { urlencoded } = require('body-parser');
const express = require('express');
const app = express();
const port = 8000;
const expresslayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
const user = require('./models/user');
const cookieParser = require('cookie-parser'); //importtant for flash msg
//used for session cookie
const session = require('express-session'); //important for flash msg
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const customeMware = require('./config/middleware');
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static('./assets'));
app.use(expresslayouts);
//extract style and script from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);
//use express router 
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(session({
  name: 'FOODADDA',
  secret: 'blashsomething',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: (100 * 6000 * 1000)
  },
  store: MongoStore.create(
    {
      mongoUrl: 'mongodb://127.0.0.1/Food_Delivery',
      autoRemove: 'disabled',
    }
  )
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customeMware.setFlash);

//use express router
app.use('/', require('./routes'));

app.listen(port, function (err) {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }
  console.log('Server is running on port', port);
}); 