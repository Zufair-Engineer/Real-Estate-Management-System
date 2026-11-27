import multer from "multer"
import ApiError from "../utils/ApiError.js";

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

// Memory Storage : file is available in req.file.buffer

const storage = multer.memoryStorage();

// validate upload file
const fileFilter = (req , file , cb)=> {
    if(!ALLOWED_IMAGE_TYPES.includes(file.mimetype)){
        return cb(new ApiError(400 , "Invalid File Type. Only JPEG, PNG and WEBP images are allowed"));
    }

    cb(null , true)
}

// Multer Configuration

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2*1024*1024 , // 2MB
        files: 1,
    }
})

// handle Multer Errors
export const handleMulterError = (err , req , res , next) => {
    if(err instanceof multer.MulterError){
        if(err.code === "LIMIT_FILE_SIZE"){
            return next(new ApiError(400 , "Image Size Must not exceed 2MB"));
        }
        
        if(err.code === "LIMIT_FILE_COUNT"){
            return next(new ApiError(400 , "Only One Image Allowed"))
        }
    
        if(err.code === "LIMIT_UNEXPECTED_FILE"){
            return next(new ApiError(400,"Unexpected File Field Name."))
        }
    
        return next(new ApiError(400 , err.message));
    }

    next(err)
}

// Reusable Upload Middleware

export const uploadAvatar = upload.single("avatar");

export const uploadPropertyImages = upload.array("images",10);

export default upload