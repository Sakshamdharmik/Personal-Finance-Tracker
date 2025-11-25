import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens =  async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) // validation mat lagao , seedha jaake save karo

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
    }
}


const registerUser = asyncHandler( async (req,res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists : using username , email
    // check for images , check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response (res)

    const {fullName, email, username, password} = req.body

    if(
        [fullName, email, username, password].some((field) => field?.trim() ==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    // Normalize username and email to lowercase for consistent checking
    const normalizedUsername = username.toLowerCase().trim()
    const normalizedEmail = email.toLowerCase().trim()

    const existedUser = await User.findOne({
        $or: [
            {username: normalizedUsername},
            {email: normalizedEmail}
        ]
    })

    if(existedUser){
        // Provide more specific error message
        if(existedUser.username === normalizedUsername){
            throw new ApiError(409, `Username "${username}" is already taken`)
        }
        if(existedUser.email === normalizedEmail){
            throw new ApiError(409, `Email "${email}" is already registered`)
        }
        throw new ApiError(409, "User already exists")
    }

    const avatarFile = req.files?.avatar?.[0];
    const coverImageFile = req.files?.coverImage?.[0];
    
    // Avatar and cover image are optional
    let avatarUrl = "";
    let coverImageUrl = "";

    if (avatarFile) {
        const avatarLocalPath = avatarFile.path;
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar) {
            avatarUrl = avatar.url;
        }
    }

    if (coverImageFile) {
        const coverImageLocalPath = coverImageFile.path;
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (coverImage) {
            coverImageUrl = coverImage.url;
        }
    }

    const user = await User.create({
        fullName: fullName.trim(),
        avatar: avatarUrl,
        coverImage: coverImageUrl,
        email: normalizedEmail,
        password,
        username: normalizedUsername
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully !!")
    )

})

const loginUser = asyncHandler(async (req,res)=>{
    // req body se apna data le aao
    // username or email based login
    // find the user (if there or not)
    // password check 
    // generate access and refresh token 
    // send cookie

    const {email,username,password} = req.body
    if(!(username || email)){
        throw new ApiError(400,"username or email is required")
    }

    // Normalize email and username to lowercase for consistent querying
    const normalizedEmail = email?.toLowerCase().trim()
    const normalizedUsername = username?.toLowerCase().trim()

    const user = await User.findOne({
        $or: [
            ...(normalizedUsername ? [{username: normalizedUsername}] : []),
            ...(normalizedEmail ? [{email: normalizedEmail}] : [])
        ]
    })
    if(!user){
        throw new ApiError(404,"User does not exist, pls register")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid User Credentials"); 
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:refreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}