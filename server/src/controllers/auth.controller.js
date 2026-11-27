import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.config.js";
import { Readable } from "stream";
import ApiResponse from "../utils/ApiResponse.js";
import { generateTokens } from "../utils/token.util.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Upload Avatar to cloudinary
const uploadAvatar = (buffer) => {
    return new Promise((resolve , reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "real-estate/avatars",
                resource_type: "image"
            },
            (error , result) => {
                if(error) return reject(error);
                resolve(result)
            }
        );
        Readable.from([buffer]).pipe(stream)
    })
}

/**
 * - Register Controller 
 * - POST /api/v1/auth/register
 */

const registerController = asyncHandler(async (req , res) => {
    // 1. Get User Data
    const {fullName , email , password , phone , role} = req.body;

    // 2. Validate Required Fields
    if(!fullName || !email || !password){
        throw new ApiError(400 , "All Fields are Required");
    }

    // 3. validate Password Length
    if(password.length < 8){
        throw new ApiError(400 , "Password Must be Atleast 8 Characters")
    }

    // 4. check Existing User
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({email: normalizedEmail});

    if(existingUser){
        throw new ApiError(409 , "Email Is Already Exist")
    }

    // 5. Restrict Public Role Assignment
    const userRole = role === "buyer" ? "buyer" : "user";

    let uploadedAvatar;
    let createdUser;

    try {
        // 6. if avatar provided
        if(req.file){
            uploadedAvatar = await uploadAvatar(req.file.buffer)
        }
        // 7. create user
        // password Automatically Hashed Pre-save Middleware

        createdUser = await User.create({
            fullName,
            email: normalizedEmail,
            password,
            phone,
            role: userRole,
            avatar: uploadedAvatar
            ? {
                public_id: uploadedAvatar.public_id,
                url: uploadedAvatar.secure_url
            }
            : undefined
        })

        // 8. Generate Token
        const {accessToken , refreshToken} = generateTokens(createdUser._id)

        // 9. store hash RefreshToken
        createdUser.refreshToken = await bcrypt.hash(refreshToken , 12);
        await createdUser.save();

        // 10. set Authentication Cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        }

        res.cookie("accessToken" , accessToken , {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        })

        res.cookie("refreshToken" , refreshToken , {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        const safeUser = {
            _id: createdUser._id,
            fullName: createdUser.fullName,
            email: createdUser.email,
            phone: createdUser.phone,
            avatar: createdUser.avatar,
            role: createdUser.role,
            isActive: createdUser.isActive,
            createdAt: createdUser.createdAt,
        };

        return res.status(201).json(
            new ApiResponse(201,{user: safeUser} , "User Register Successfully")
        )

    } catch (error) {

        // Cleanup database user if registration fails
        if (createdUser?._id) {
            await User.findByIdAndDelete(createdUser._id).catch(() => {});
        }

        if(uploadedAvatar?.public_id){
            await cloudinary.uploader.destroy(uploadedAvatar.public_id).catch(() => {})
        }
        throw error;
    }

})


/**
 * - Login Controller 
 * - POST /api/v1/auth/login
 */

const loginController = asyncHandler(async (req , res) => {
    const {email , password } = req.body;

    // 1. validate Input
    if(!email || !password){
        throw new ApiError(400 , "Email and Password Are Required")
    }

    // 2. Find User
    const user = await User.findOne({email: email.toLowerCase().trim()}).select("+password +refreshToken");
    if(!user){
        throw new ApiError(404,"Invalid Email or Password")
    }

    // 3. check account Status
    if(!user.isActive){
        throw new ApiError(403 , "Your Account is Inactive");
    }

    // 4. verify password
    const isPasswordVerify = await user.comparePassword(password);
    if(!isPasswordVerify){
        throw new ApiError(401,"Invalid Email or Password")
    }

    // 5. Generate tokens
  const { accessToken, refreshToken } = generateTokens(
    user._id.toString()
  );

  // 6. Store hashed refresh token
  user.refreshToken = await bcrypt.hash(refreshToken, 12);
  await user.save();

  // 7. Cookie configuration
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  // 8. Set cookies
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // 9. Safe user response
  const safeUser = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: safeUser },
      "Login successful"
    )
  );

})

/**
 * - Logout Controller
 * - GET /api/v1/auth/logout
 */

const logoutController = asyncHandler(async (req , res) => {
    // 1. find Authenticated User
    const user = await User.findById(req.user._id).select("+refreshToken");

    if(!user){
        throw new ApiError(404,"User Not Found")
    }

    // Invalid RefreshToken
    user.refreshToken = null;
    await user.save();

    // 3. Clear authentication cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  // 4. Send response
  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Logout successful"
    )
  );
})

/**
 * - refreshAccessToken
 * - POST /api/v1/auth/refreshAccessToken
 */

const refreshAccessToken = asyncHandler(async(req , res)=>{
    // 1. Get RefreshToken from cookie
    const incomingRefreshToken = req.cookies?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh Token is Required")
    }

    // 2. verify Refresh Token
    const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    // 3. Find User and include stored RefreshToken
    const user = await User.findById(decoded.id).select("+refreshToken");
    if(!user || !user.isActive){
        throw new ApiError(401, "Invalid user or account inactive");
    }

    if(!user.refreshToken){
        throw new ApiError(401,"Refresh Token Not Found")
    }

    const isTokenValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!isTokenValid) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    // 5. Generate New Token
    const {accessToken , refreshToken} = generateTokens(user._id);

    // 6. Hash and Save new Refresh Token
    user.refreshToken = await bcrypt.hash(refreshToken, 12);
    await user.save();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    }

     // 8. Set new cookies
    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 9. Response
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Access Token Refreshed Successfully"
        )
    );
})

/**
 * - Get User Profile
 * - GET /api/v1/auth/getme
 */

const getCurrentUser = asyncHandler(async(req, res)=>{
    // 1. get Authenticated user from protect middleware
    const authUser = req.user;

    if(!authUser){
        throw new ApiError(401, "User is not authenticated");
    }

    // 3. Return safe user data
    const safeUser = {
        _id: authUser._id,
        fullName: authUser.fullName,
        email: authUser.email,
        phone: authUser.phone,
        avatar: authUser.avatar,
        role: authUser.role,
        isActive: authUser.isActive,
        createdAt: authUser.createdAt,
        updatedAt: authUser.updatedAt,
    };

    return res.status(200).json(
        new ApiResponse(200, { user: safeUser }, "Current user retrieved successfully")
    );
})

export {
    registerController,
    loginController,
    logoutController,
    getCurrentUser,
    refreshAccessToken
}

