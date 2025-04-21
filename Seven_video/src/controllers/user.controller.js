import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// creating method to access both token easily
const generateAccessAndRefereshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)  //retriving the user of the given userId from DB
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken  // need to store refresh token into db 
        await user.save({validateBeforeSave: false}) //*** so save it into the DB and the password 
        // validation will be kicked up.. so avoid this we did the validateBeforeSave: false

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token!")
    }
}

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

const loginUser = asyncHandler(async (req,res)=>{
    // req body -> data
    // username or email base login
    // find the user
    // password check
    // is password verified then access and refresh token generate
    // send token by cookie to the userbrowser localstorage

    const {email, username, password} = req.body
    console.log(email);
    
    
    // login by username and email
    if (!username && !email) {
        throw new ApiError(400,"username or email is required")
    }

    // searching in mongo with username or email and got the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404,"User does not exist!")
    }

    // checking password by isPasswordCorrect which made in User model 
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid user credentials(password invalid!)")
    }

    // generate accessToken and refreshToken
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    // again searching for user because after token creating the previous
    //  user not stored it by it's reference
    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken ")

    //cookie time
    const options = {
        httpOnly: true,  // by this two the cookie will be only able to modified 
        // into server not into frontend
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )


})

const logoutUser = asyncHandler(async (req,res)=>{
    // req.user ==> for getting that we did cookie==> access token==> auth.middleware ==> router
    // https://youtu.be/7DVpag3cO0g?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW

    await User.findByIdAndUpdate(
        // for update in mongodb ***
        req.user._id, //for finding by which
        {  // what to update
            $set: { 
                refreshToken: undefined
            }
        },
        {
            new: true  // to get the new update response with undefined refreshtoken
        }
    )

    //cookie time for edit the cookies ****
    const options = {
        httpOnly: true,  // by this two the cookie will be only able to 
        // modified into server not into frontend
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}