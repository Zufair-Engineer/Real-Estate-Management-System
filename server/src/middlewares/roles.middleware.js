import ApiError from "../utils/ApiError.js";

const authorizedRoles = (...allowRoles) => {
    return (req , res , next) => {
        if(!req.user){
            throw new ApiError(401 , "Authentication Required");
        }
        if(!allowRoles.includes(req.user.role)){
            throw new ApiError(403 , "Forbidden : You don't have permission to access this resource")
        }

        next();
    }
}

export default authorizedRoles;