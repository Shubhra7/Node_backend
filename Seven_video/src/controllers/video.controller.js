import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError}  from "../utils/ApiError.js";
import {Video} from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";
import{
    uploadOnCloudinary,
    deleteOnColudinary
} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js";

const publishAVideo = asyncHandler(async(req,res)=>{
    const {title,description} = req.body;

    if([title,description].some((field)=> field?.trim()==="")){
        throw new ApiError(400,"All Fields are required to publish a Video!!");
    }

    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if(!videoFileLocalPath){
        throw new ApiError(400,"videoFileLocalPath is required!!");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnailLocalPath is required!!");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new ApiError(400,"Video file not found (issue in cloudinary)");
    }
    if(!thumbnail){
        throw new ApiError(400,"Thumbnail not found(issue in cloudinary upload)!");
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
        owner: req.user?._id,
        isPublished: false
    });

    const videoUploaded = await Video.findById(video._id);

    if(!videoUploaded){
        throw new ApiError(500, "videoUpload failed please try again!(issue during create object in MONGOdb)");
    }

    return res.status(200).json(
        new ApiResponse(200,video,"Video uploaded successfully")
    )
});

export{
    publishAVideo
}

