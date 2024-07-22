const ErrorHandler = require("../utils/errorHandler");
const jwt=require("jsonwebtoken")
const User=require("../model/userModel")
exports.isAuthenticateUser=async (req,res,next)=>{
    try {
        const token=await req.headers.authorization.split(" ")[1];
        // console.log(token)
        if(!token){
            return next(new ErrorHandler("Login is required",401))
        }
        const decodedData=jwt.verify(token,process.env.JWT_SECRET)
        req.user=await User.findById(decodedData.id)
        next()
    } catch (error) {
        res.status(400).json({
            error:error
        })
    }
}
exports.isAuthorizedRole=(...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
           return next(new ErrorHandler(`This role ${req.user.role} is not allowed `,403))
        }
        next()
    }

}