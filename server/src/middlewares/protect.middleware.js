import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const protect = asyncHandler(async (req , res , next) => {
    // 1. Get Access token from HTTP-only cookie
    const accessToken = req.cookies?.accessToken;

    if(!accessToken){
        throw new ApiError(401 , "Access Token Is Missing");
    }

    // 2. Verify Access Token
    const decoded = jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET);

    // 3. find user
    const user = await User.findById(decoded.id);

    if(!user || !user.isActive){
        throw new ApiError(401 , "User Not Found or Inactive")
    }

    // 4. Attach user to request
    req.user = user;

    // 5. Continue
    next();
})

export default protect;