const express=require("express")
const router=express.Router()
const {isAuthenticateUser,isAuthorizedRole}=require("../middleware/auth")
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require("../controller/orderController")
router.post("/order/new",isAuthenticateUser,newOrder);
router.get("/orders/:id",isAuthenticateUser,isAuthorizedRole("admin"),getSingleOrder);
router.get("/order/me",isAuthenticateUser,myOrders)

router.get("/admin/orders",isAuthenticateUser,isAuthorizedRole("admin"),getAllOrders)
router.put("/admin/order/:id",isAuthenticateUser,isAuthorizedRole("admin"),updateOrder);
router.delete("/admin/order/:id",isAuthenticateUser,isAuthorizedRole("admin"),deleteOrder)
module.exports=router