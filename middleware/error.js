const ErrorHandler = require("../utils/errorHandler")
module.exports = (err,req, res, next) => {
    err.statuscode || 500;
    err.message = err.message || "Iternal server Error";
    res.status(err.statuscode).json({
        success:false,
        error:err.message
    })
}