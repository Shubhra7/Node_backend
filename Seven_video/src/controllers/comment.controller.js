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

// update a comment
const updateComment = asyncHandler(async (req,res)=>{
    const { commentId }= req.params;
    const { content }=req.body;

    if(!content){
        throw new ApiError(400,"content is required");
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "Comment not found!");
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"Only comment owner can edit their comment!");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set:{
                content
            }
        },
        {new:true} // to get the updated record
    );

    if(!updatedComment){
        throw new ApiError(500,"Failed to edit comment please try again");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment,"Comment edited successfully")
        );
});

// delete a comment
const deleteComment = asyncHandler(async (req,res)=>{
    const { commentId }=req.params;

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404,"Comment not found");
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"Only comment owner can delete their comment!");
    }

    await Comment.findByIdAndDelete(comment)

    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200,{ commentId },"Comment deleted successfully")
        );
})

export {
    addComment,
    updateComment,
    deleteComment
}