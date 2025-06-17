import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers
} from "../controllers/subscription.controller.js";
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT);

router
    .route("/c/:channelId")
    .post(toggleSubscription)
    .get(getUserChannelSubscribers)

export default router;