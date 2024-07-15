const mongoose=require("mongoose");
const validator=require("validator");
const { validate } = require("./productModel");
const bcrypt=require("bcryptjs")
const jwt =require("jsonwebtoken")
const crypto=require("crypto")
const dotenv=require("dotenv")
dotenv.config({path:"../config/config.env"})

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30,"Maxlength cannot be exceed more then 30 character"],
        minLength:[4,"Min length cannot be less then 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Email cannot be empty"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[8,"Password length must be greater then 8 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,


})
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
   this.password= await bcrypt.hash(this.password,10)
})
//jwt token
userSchema.methods.getJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}
userSchema.methods.comparedPassword=async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}
//Generating reset password token
userSchema.methods.getResetPasswordToken= function(req,res,next){
//Generate Token
const resetToken = crypto.randomBytes(20).toString("hex")
//hash and adding resetPasswordToken to userSchema
this.resetPasswordToken= crypto.createHash("sha256").update(resetToken).digest("hex");
this.resetPasswordExpire=Date.now()+15*60*1000;
return resetToken;
}
module.exports=mongoose.model("User",userSchema)