const Order = require("../model/orderModel")
const Product = require("../model/productModel")
const ErrorHandler = require("../utils/errorHandler")
exports.newOrder = async (req, res, next) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice } = req.body;
        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user._id,
        });
        res.status(201).json({
            success: true,
            order
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            error: error.message
        })
    }
}
// Get single order
exports.getSingleOrder=async (req,res,next)=>{
  try {
    const order=await Order.findById(req.params.id).populate("user","name email");//In params provide order's id after login admin
    if(!order){
        return next(new ErrorHandler("Order not found with this id",400))
    }
    res.status(200).json({
        success:true,
        order
    })
  } catch (error) {
    res.status(400).json({
        success:false,
        msg:error.message
    })
  }
}
// Get loggedIn user Orders
exports.myOrders=async (req,res,next)=>{
try {
    const orders=await Order.find({user:req.user._id})
    // if(!order){
    //     return next(new ErrorHandler("Order not found with this Id",404))
    // }
    res.status(201).json({
        success:true,
        orders
    })
} catch (error) {
    res.status(400).json({
        success:false,
        error:error.message
    })
}
}
//Get all order by admin
exports.getAllOrders=async (req,res,next)=>{
    try {
        const orders=await Order.find();
        let totalAmount=0;
        orders.forEach((order)=>{
            totalAmount+=order.totalPrice
        })
        res.status(200).json({
            success:true,
            totalAmount,
            orders
            
        })
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}
// Update order status
exports.updateOrder=async (req,res,next)=>{
  try {
    const order=await Order.findById(req.params.id);
    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("You have already delivered this order",400))
    }
    order.orderItems.forEach(async(order)=>{
        await updateStock(order.product,order.quantity)
    });
    order.orderStatus=req.body.status;
    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now()
    }
    res.status(200).json({
        success:true,
    })
    await order.save({validateBeforeSave:false})
  } catch (error) {
    
  }

}
async function updateStock(id,quantity){
   const product=await Product.findById(id)
   product.stock-=quantity;
   await product.save({validateBeforeSave:false})
}
//delete order --Admin
exports.deleteOrder=async (req,res,next)=>{
try {
    const order=await Order.findById(req.params.id)
    if(!order){
        return next(new ErrorHandler("Order not found with thid Id",400))
    }
    await order.deleteOne()
    res.status(200).json({
        success:true
    })
} catch (error) {
    res.status(400).json({
        success:false,
        error:error.message
    })
}
}