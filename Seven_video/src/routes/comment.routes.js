import {Router} from "express";
import {
    addComment
} from "../controllers/comment.controller.js";
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middleware.js';

const router = Router()

router.use(verifyJWT, upload.none());

router.route("/:videoId").post(addComment)

export default router;