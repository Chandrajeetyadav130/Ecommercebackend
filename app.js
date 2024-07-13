const express=require("express")
const cookieParser=require("cookie-parser")
const bodyParser=require("body-parser")
const fileUpload=require("express-fileupload")
var cors = require('cors');

const app=express();
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())
const errorMiddleware=require("./middleware/error")

//route Import
const products=require("./routes/productRoutes")
const users=require("./routes/userRoute")
const order=require("./routes/orderRoutes")

app.use(cors());
app.use("/api/v1",products)
app.use("/api/v1",users)
app.use("/api/v1",order)


app.use(errorMiddleware)

module.exports=app