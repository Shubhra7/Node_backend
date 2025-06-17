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

export {
    toggleSubscription
}