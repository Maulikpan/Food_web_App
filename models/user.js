const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    name:{
    type:String,
    required:true, 
   },
},{
    timestamps:true   //created at....... updated at
})
const User= mongoose.model('User',userSchema); 
module.exports=User;  