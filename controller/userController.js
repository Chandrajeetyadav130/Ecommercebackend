const ErrorHandler = require("../utils/errorHandler")
const User = require("../model/userModel")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")
const cloudinary=require("cloudinary")
exports.registerUser = async (req, res) => {
    try {
        const myCloud=await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:"avatars",
            width:150,
            crop:"scale"
        })
        const { name, email, password } = await req.body;
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        })
        // const token=user.getJwtToken()
        // res.status(201).json({
        //     success:true,
        //     token
        // })
        sendToken(user, 201, res)


    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// Login user
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = await req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please enter valid email or password", 401))
        }
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401))
        }
        const isMatched = await user.comparedPassword(password)
        if (!isMatched) {
            return next(new ErrorHandler("Invalid email or password", 401))
        }
        //    const token= user.getJwtToken();
        //    res.status(201).json({
        //     success:true,
        //     token:token
        //    })
        sendToken(user, 201, res)

    } catch (error) {
        res.status(400).json({ error: error.message })

    }

}
//logout user
exports.logout = async (req, res, next) => {
    try {
        res.clearCookie("token")
        // res.cookie("token", null, {
        //     expires: new Date(Date.now()),
        //     httpOnly: true
        // })
        res.status(200).json({
            success: true,
            msg: "loged out successful"
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })

    }

}
//forgot password
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = await req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return next(new ErrorHandler("User not founds for forgot", 400))
            // res.status(400).json({msg:"User not found"})
        }
        //getResetPasswordtoken
        const resetToken = user.getResetPasswordToken()
        await user.save({ validateBeforeSave: false })
        const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
        const message = `Your reset password token is :\n\n ${resetPasswordUrl} \n\n If you have not requested this email please ignore it `
        try {
            await sendEmail({
                email: user.email,
                subject: "Ecommerce password  recovery",
                message
            })

            res.status(200).json({
                success: true,
                message: `Email send to ${user.email} successfully`
            })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false })
            return next(new ErrorHandler(error.message, 500))
            // res.status(400).json({ errorMsg: error.message })

        }

    } catch (error) {
        res.status(400).json({ error: error.message })

    }

}
//reset password
exports.resetPassword = async (req, res, next) => {
    try {
        resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })
        if (!user) {
            return next(new ErrorHandler("Reset password token is invalid or has been expired", 400))
        }
        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not matced ", 400))
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save()
        sendToken(user, 200, res)

    } catch (error) {
        res.status(400).json({ errormsg: error.message })
    }
}
// getUserDetails (own's detail)
exports.getUserDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
//updatUser Password
exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")
    const isPasswordMatched = await user.comparedPassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400))
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password doesnot matched", 400))
    }
    user.password = req.body.newPassword;
    await user.save()
    sendToken(user, 200, res)
}
// update user profile
exports.updateProfile = async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        }

        if (req.body.avatar !== "") {
            const user = await User.findById(req.user.id);
        
            const imageId = user.avatar.public_id;
        
            await cloudinary.v2.uploader.destroy(imageId);
        
            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
              folder: "avatars",
              width: 150,
              crop: "scale",
            });
        
            newUserData.avatar = {
              public_id: myCloud?.public_id,
              url: myCloud?.secure_url,
            };
          }

        await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
        res.status(200).json({
            success: true,
        })
        
    } catch (error) {
        console.log(error );
        res.status(400).json({ success:false,error:error.message})
    }

}
// getAllUsers (by admin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
        res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}
//get single user by admin
exports.getSingleUser= async (req, res, next) => {
    try {
      const user=await User.findById(req.params.id);
      if(!user){
        return next(new ErrorHandler(`User does not exists${req.params.id}`,400))
      }
      res.status(200).json({
        success:true,
        user
      })
      
    } catch (error) {
     res.status(400).json({success:false,error:error.message})
    }
}
// update user role by Admin
exports.UpdateUserRole=async (req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:true
    })
    res.status(200).json({
        success:true
    })
}
//delete user by Admin
exports.deleteUser=async (req,res,next)=>{
try {
    const user=await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler(`User does not exist with id ${req.params.id}`,400))
    }
    await user.deleteOne();
    res.status(200).json({
        success:true,
        msg:"User deleted successfully"
    })
} catch (error) {
    res.status(400).json({
        success:false,
        error:error.message
    })
}
}
