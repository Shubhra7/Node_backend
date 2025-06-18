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

export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist
}