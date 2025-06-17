import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError}  from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose, {isValidObjectId} from "mongoose";
import {Subscription} from "../models/subscription.model.js";

// Toggle Subscription 
const toggleSubscription = asyncHandler(async (req,res)=>{
    const { channelId }=req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channelId");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if(isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed?._id);

        return res
              .status(200)
              .json(
                new ApiResponse(
                    200,
                    { subscribed: false},
                    "unsunscribed successfully"
                )
              );
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribed: true },
                "Subscribed successfully"
            )
        );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req,res)=>{
    let { channelId }=req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channelId");
    }

    channelId = new mongoose.Types.ObjectId(channelId);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            // Meaning — has the requesting channel followed this subscriber back?

                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false
                                }
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id:0,
                subscriber: {
                    _id:1,
                    username:1,
                    fullName:1,
                    avatar:1,
                    subscribedToSubscriber:1,
                    subscribersCount:1,
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "Subscribers fetched successfully"
            )
        )
});

export {
    toggleSubscription,
    getUserChannelSubscribers
}