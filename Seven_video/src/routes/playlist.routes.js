import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import {
    createPlaylist,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";

const router = Router()

router.use(verifyJWT,upload.none());

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
    .patch(updatePlaylist)
    .delete(deletePlaylist)

export default router;