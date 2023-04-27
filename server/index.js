const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const cors = require("cors")
const multer = require("multer")
const path = require("path")

//requiring all the routes
const userRoute = require("./Routes/users")
const authRoute = require("./Routes/auth")
const postRoute = require("./Routes/posts")
const conversationRoute = require("./Routes/Conversations")
const messageRoute = require("./Routes/Messages")

dotenv.config()

//defining required global varaibles
const app = express()
const PORT = process.env.PORT || 9000
const DB_URL = process.env.MONGODB_URL



//DB Connection
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("DB connected")
    })
    .catch((err) => {
        console.log("DB connection Error : " + err)
    })



app.use("/images", express.static(path.join(__dirname, "public/images")))


//MiddleWares
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))
app.use(cors())




//note: images file uploading in the server app using multer

const storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
      cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }

  })
   
  const upload = multer({ storage: storage })


app.post("/api/upload", upload.single("file"), (req, res) => {
    console.log("we are enterrring the upload path location in the server")
    try {
        console.log("we are enterrring the try block of the server app")
        return res.status(200).json("File uploaded successfully")

    } catch (err) {
        res.status(500).json(err)
    }
})
 

//note: defining the initial api paths fot the uers auth and post routes
app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/posts", postRoute)
app.use("/api/conversations", conversationRoute)
app.use("/api/messages", messageRoute)


//Routes API
app.get("/", (req, res) => {
    res.send("Welcome to the server")
})


//Server Connection
app.listen(PORT, () => {
    console.log(`Backend server is running on ${PORT}`)
})