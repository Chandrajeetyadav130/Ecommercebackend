const app= require("./app")
const mongoose=require("mongoose")
const dotenv=require("dotenv")
const cloudinary=require("cloudinary")
dotenv.config({path:"./config/config.env"})
const port=process.env.PORT
const server=app.listen(port,()=>{
    console.log(`Server is listen at ${port}`)
})
const dbUrl=process.env.mongodbUrl
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.API_SECRET_KEY
})
 mongoose.connect(dbUrl,{
  
    // useNewUrlParser:true,
    // useUnifiedTopology:true
    }).then((val)=>{
        console.log("connection ok")
    }).catch((error)=>{
        console.log(error)
    })
    