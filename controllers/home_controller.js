const User=require('../models/user');
const passport=require('../config/passport-local-strategy');
module.exports.home=function(req,res){
 return res.render('home',{title:'Home Page'});
}