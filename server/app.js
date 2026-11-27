import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/auth.route.js";
import errorMiddleware from "./src/middlewares/error.middleware.js";
import { handleMulterError } from "./src/middlewares/multer.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/api/v1/auth',authRouter);
app.use(handleMulterError);
app.use(errorMiddleware)

export default app;