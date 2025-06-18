import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import {
    createPlaylist
} from "../controllers/playlist.controller.js";

const router = Router()

router.use(verifyJWT,upload.none());

router.route("/").post(createPlaylist)

export default router;