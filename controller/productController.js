const Apifeatures = require("../utils/apifeatures")
const Product = require("../model/productModel")
const ErrorHandler = require("../utils/errorHandler")
//create a product -- Admin 
const catchAsyncError = require("../middleware/catchAsyncError")
exports.createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;//store logedin user id inside the product model
    const product = await Product.create(req.body)
    res.status(201).json({
      success: true,
      product
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }



};
//get all product
exports.getAllProducts = async (req, res) => {
  try {
    const resultPerpage = 8;
    const productCount = await Product.countDocuments()
    const apifeatures = new Apifeatures(Product.find(), req.query).search().filter().pagination(resultPerpage)
    const product = await apifeatures.query;
    // const product = await Product.find()
    res.status(200).json({
      success: true,
      product,
      productCount: productCount,
      resultPerpage
    })
  } catch (error) {
    res.status(400).json({ error: error })
  }

}
//product details
exports.getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return next(new ErrorHandler("Product not found", 404))
    }
    res.status(200).json({
      success: true,
      product
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }

}

//update product --admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id)
    if (!product) {
      // return next(new ErrorHandler("Page not found",500))
      return res.status(500).json({
        success: false,
        msg: "Product not found"
      })
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    })
    res.status(201).json({
      success: true,
      product
    })
  } catch (error) {
    res.status(400).json({ error })
  }

}
// delete a product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(500).json({ success: true, msg: "Product not found" })
    }
    await Product.deleteOne({ _id: req.params.id })
    res.status(201).json({
      success: true,
      msg: "Product deleted successful"
    })
  } catch (error) {
    res.status(400).json({ error })
  }
}
//Create a new review or update the review
exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    }
    const product = await Product.findById(productId)
    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          rev.rating = rating, rev.comment = comment;
        }
      })
    }
    else {
      product.reviews.push(review);
      product.numOfReview = product.reviews.length;
    }
    let avg = 0;
    product.ratings = product.reviews.forEach((rev) => {
      avg += rev.rating;
    })
    product.ratings = avg / product.reviews.length;
    await product.save({ validateBeforeSave: false })
    res.status(200).json({
      success: true
    })
  } catch (error) {

  }
}
//Get All Review of a Product
exports.getProductReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 400))
    }
    res.status(200).json({
      success: true,
      reviews: product.reviews
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: error.message
    })
  }

}
//Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.productId)
    if (!product) {
      return next(new ErrorHandler("Product not found", 400))
    }
    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString())
    let avg = 0;
    reviews.forEach((rev) => {
      avg += rev.rating;
    })
    const ratings = avg / reviews.length;
    const numOfReview = reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,
      {
        reviews, ratings, numOfReview
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false
      }
    );
    res.status(200).json({
      success:true,
    })

  } catch (error) {
    res.status(400).json({
      success:false,
      msg:error.message
    })
  }


}