const sendToken=(user,statuscode,res)=>{
 const token=user.getJwtToken()
 // option for cookie
 const option={
    expires:new Date(Date.now()+process.env.cookie_expires*24*60*60*1000),
    httpOnly:true
 }
 res.status(statuscode).cookie("token",token,option).json({
    success:true,
    user,
    token
 })
}
module.exports=sendToken