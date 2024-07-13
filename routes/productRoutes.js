const express=require("express");
const {isAuthenticateUser,isAuthorizedRole}=require("../middleware/auth")
const { getAllProducts,createProduct, updateProduct ,deleteProduct,getProductDetails, createProductReview, getProductReview, deleteReview} = require("../controller/productController");
const router=express.Router()
router.get("/products",getAllProducts)
router.post("/products/new",isAuthenticateUser,isAuthorizedRole("admin"),createProduct)
router.put("/products/:id",isAuthenticateUser,isAuthorizedRole("admin"),updateProduct)
router.delete("/products/:id",isAuthenticateUser,isAuthorizedRole("admin"),deleteProduct)
router.put("/review",isAuthenticateUser,createProductReview)
router.get("/reviews",getProductReview);
router.delete("/reviews",isAuthenticateUser,deleteReview)
router.get("/products/:id",getProductDetails)



module.exports=router;