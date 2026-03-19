import { Router } from "express";
import { register, verifyOtp, login, getMe, logout } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register", registerValidator, register);


/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }
 */
authRouter.post("/login", loginValidator, login)



/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user's details
 * @access Private
 */
authRouter.get('/get-me', authUser, getMe)

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify user's email address
 * @access Public
 * @body { email, otp }
 */
authRouter.post('/verify-otp', verifyOtp)

authRouter.get('/logout', authUser, logout)

export default authRouter;