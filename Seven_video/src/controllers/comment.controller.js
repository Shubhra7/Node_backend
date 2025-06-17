import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError}  from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

// add a comment to a video
const addComment = asyncHandler(async (req,res)=>{
    const { videoId }= req.params;
    const { content }=req.body;

    if(!content){
        throw new ApiError(400,"Content is required!");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    if(!comment){
        throw new ApiError(500,"Failed to add comment please try again");
    }

    return res
        .status(201)
        .json(new ApiResponse(201,comment, "Comment added successfully"))
});

export {
    addComment
}