import express from "express"
import {
    getCurrentUser,
    loginController,
    logoutController,
    refreshAccessToken,
    registerController
} from "../controllers/auth.controller.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";
import protect from "../middlewares/protect.middleware.js";
const authRouter = express.Router();

authRouter.post('/register' , uploadAvatar, registerController);
authRouter.post('/login', loginController);
authRouter.get('/logout', protect, logoutController);
authRouter.post('/refreshAccessToken', refreshAccessToken);
authRouter.get('/getme', protect, getCurrentUser);

export default authRouter