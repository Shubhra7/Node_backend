import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError}  from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose, {isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

// For creating playlist by logined user
const createPlaylist = asyncHandler(async (req,res)=>{
    const { name, description } = req.body;

    if(!name || !description){
        throw new ApiError(400,"name and description both are required!");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    if(!playlist){
        throw new ApiError(500,"Failed to create playlist!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,playlist,"Playlist created successfully")
        );
});

// update a playlist, given playlist ID
const updatePlaylist = asyncHandler(async (req,res)=>{
    const { name, description }=req.body;
    const { playlistId } = req.params;

    if(!name||!description){
        throw new ApiError(400,"name and description both are required!!");
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist Id")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist is not found!!");
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"only owner can edit the playlist!");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $set: {
                name,
                description
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        )
})

// delete a playlist by given playlist id
const deletePlaylist = asyncHandler(async (req,res)=>{
    const { playlistId }= req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"only owner can delete the playlist");
    }

    await Playlist.findByIdAndDelete(playlist?._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist updated successfully"
            )
        );
});

const addVideoToPlaylist = asyncHandler(async (req,res)=>{
    const { playlistId, videoId }= req.params;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid PlaylistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(!video){
        throw new ApiError(404,"video not found");
    }

    if(
        (playlist.owner?.toString() && video.owner.toString())!==
        req.user?._id.toString()
    ){
        throw new ApiError(400,"only owner can add video to their playlist ");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            // addToSet is an update operator used to add a value to an array 
            // only if it doesn’t already exist in that array
            $addToSet:{ 
                videos: videoId,
            }
        },
        { new: true }
    )

    if(!updatedPlaylist){
        throw new ApiError(
            400,
            "failed to add video to playlist please try again"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Added video to playlist successfully"
            )
        );
})

export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist
}