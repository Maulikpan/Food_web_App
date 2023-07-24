//require to library 
const mongoose = require('mongoose');
//connect  odm( mongoose )to database
mongoose.connect('mongodb://127.0.0.1/Food_Delivery');
//acquire a connection to access (to check if it succesfull) 
const db=mongoose.connection; //db is definition for conection of mongoose to db;
//error if not connecting successfull
db.on('error',console.error.bind(console,'error connecting to db'));
//if success and up and running 
db.once('open',function (){
    console.log('succesfully connected to database');
});
module.exports=db;