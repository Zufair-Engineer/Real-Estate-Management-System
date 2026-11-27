import express from "express"
import { loginController, logoutController, registerController } from "../controllers/auth.controller.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";
import protect from "../middlewares/protect.middleware.js";
const authRouter = express.Router();

authRouter.post('/register' , uploadAvatar, registerController);
authRouter.post('/login', loginController);
authRouter.get('/logout', protect, logoutController);

export default authRouter