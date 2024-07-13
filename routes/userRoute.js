const express=require("express");
const{registerUser,loginUser,logout,forgotPassword, resetPassword,getUserDetails, updatePassword, updateProfile, getAllUsers,
     getSingleUser, UpdateUserRole, deleteUser}=require("../controller//userController")
const {isAuthenticateUser,isAuthorizedRole}=require("../middleware/auth")
const router=express.Router()
router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/password/forgot",forgotPassword)
router.put("/password/reset/:token",resetPassword)
router.get("/me",isAuthenticateUser,getUserDetails)
router.put("/password/update",isAuthenticateUser,updatePassword)
router.put("/me/update",isAuthenticateUser,updateProfile);
router.get("/admin/user",isAuthenticateUser,isAuthorizedRole("admin"),getAllUsers)
router.get("/admin/user/:id",isAuthenticateUser,isAuthorizedRole("admin"),getSingleUser)
router.put("/admin/user/:id",isAuthenticateUser,isAuthorizedRole("admin"),UpdateUserRole)
router.delete("/admin/user/:id",isAuthenticateUser,isAuthorizedRole("admin"),deleteUser)

router.get("/logout",logout)
module.exports=router;
