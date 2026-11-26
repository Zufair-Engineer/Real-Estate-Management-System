import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    error = new ApiError(
      400,
      "Validation failed",
      Object.values(err.errors).map((item) => item.message)
    );
  }

  // MongoDB Duplicate Key Error
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];

    error = new ApiError(
      409,
      `${field || "Field"} already exists`
    );
  }

  // Invalid MongoDB ObjectId
  else if (err.name === "CastError") {
    error = new ApiError(400, "Invalid resource ID");
  }

  // Invalid JWT
  else if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid access token");
  }

  // Expired JWT
  else if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Access token expired");
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message:
      statusCode === 500
        ? "Internal Server Error"
        : error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default errorMiddleware;
