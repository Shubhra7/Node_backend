import {Router} from "express";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

import {
    publishAVideo,
    getVideoById
} from "../controllers/video.controller.js";

const router = Router();

router.route("/").post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount:1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
);

router
    .route("/v/:videoId")
    .get(verifyJWT, getVideoById)

export default router