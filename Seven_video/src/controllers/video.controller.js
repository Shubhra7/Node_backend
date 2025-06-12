import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError}  from "../utils/ApiError.js";
import {Video} from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";
import {User} from "../models/user.model.js";
import{
    uploadOnCloudinary,
    deleteOnColudinary
} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js";


// get video, upload to cloudinary, create video
// Publish video 
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

//Get video by id
const getVideoById = asyncHandler(async (req,res)=>{
    const { videoId } = req.params;
    // taking video_id for request

    if(!isValidObjectId(videoId)){ //inbuild function the given id is valid or not?
        throw new ApiError(400, "Invalid VideoId");
    }
    
    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(400, "Invalid userId");
    }
    // console.log("Hello bubai2");
    // console.log("user: ",req.user);
    const user_copy_id = new mongoose.Types.ObjectId(req.user._id);
    // console.log("user345: ", user_copy_id);
    


    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [
                                            req.user?._id,
                                            "$subscribers.subscriber"
                                        ]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            "avatar":1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                "videoFile.url":1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration:1,
                comments: 1,
                owner: 1,
                likesCount:1,
                isLiked:1
            }
        }
    ]);

    if(!video){
        throw new ApiError(500,"failed to fetch video");
    }

    // increment views if video fetched successfully
    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    });

    // console.log("User2 checkjjh:", req.user._id);
    // console.log("User2 check:", user_copy_id);
    
    // add this video to user watch history
    await User.findByIdAndUpdate(req.user?._id, {
        // addToSet adds a value to an array only if it 
        // doesn't already exist (i.e., prevents duplicates).
        $addToSet: {  
            watchHistory: videoId
        }
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, video[0], "video details fetched successfully")
    );

});

export{
    publishAVideo,
    getVideoById
}

