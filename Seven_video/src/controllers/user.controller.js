import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username,email
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, email, username, password} = req.body
    // console.log("email: ",email);

    // if (fullName===""){
    //     throw new ApiError(400,"Fullname is required");
    // }

    // advance together check that each value has given or not?
    if(
        [fullName, email,username, password].some((field)=> field?.trim()=="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    // check same user exist or not?
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    // console.log(req.files);
    

    // for taking...getting the localpath or not?
    const avatarLocalPath = req.files?.avatar[0]?.path; // multer gives file method 
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    // because the coverImage is not manditory so need to check like that
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    // avatar is given or not?
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    // uploading on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // check beacuse avatar field is required
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }

    // creating User type object with the given data to push in Db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // chaining for which item not want to take like password, refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" // '-' for excepted that selection 
    )

    // check our error for creating user object
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    // For sending the created user response!!
    return res.status(201).json(
        new ApiResponse(200, createdUser,"User registered Successfully.")
    )
})

export {registerUser}