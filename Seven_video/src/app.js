import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// middleware configuration for the app
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true  // This allows the server to accept cookies, authorization headers, or TLS client certificates from the client.
}))

app.use(express.json({limit: "16kb"})) 
// for handle the json req size limit, by default it is 100kb

app.use(express.urlencoded({extended: true, limit: "16kb"}))
// for handle when data req come as URL request to know the encoded part like ==> space = 20%

app.use(express.static("public"))
// for handle the static file like image, css, js etc

app.use(cookieParser())
// for handle the cookie


// routes import
import userRouter from './routes/user.routes.js'

// routes declaration 
app.use("/api/v1/users",userRouter)

// http://localhost:8000/api/v1/users/register

app.get('/',(req,res)=>{
    res.json({
        "name":"Shubhrajit!"
    })
})

export { app }