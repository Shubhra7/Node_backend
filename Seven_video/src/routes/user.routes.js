import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js"
import {upload} from '../middleware/multer.middleware.js'

const router = Router()

router.route("/register").post(
    upload.field([     // adding the upload multer middleware
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ])
    ,registerUser)



export default router