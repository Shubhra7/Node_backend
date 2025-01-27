import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// middleware configuration for the app
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"})) 
// for handle the json req size limit, by default it is 100kb

app.use(express.urlencoded({extended: true, limit: "16kb"}))
// for handle when data req come as URL request to know the encoded part like ==> space = 20%

app.use(express.static("public"))
// for handle the static file like image, css, js etc

app.use(cookieParser())
// for handle the cookie

export { app }