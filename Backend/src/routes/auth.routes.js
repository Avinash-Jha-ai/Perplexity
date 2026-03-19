import { Router } from "express";
import { register, verifyOtp, login, getMe, logout, resendOtp, googleAuth } from "../controllers/auth.controller.js";
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
 * @route POST /api/auth/google
 * @desc Google Auth
 * @access Public
 * @body { credential }
 */
authRouter.post('/google', googleAuth)


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

/**
 * @route POST /api/auth/resend-otp
 * @desc Resend OTP to user's email
 * @access Public
 * @body { email }
 */
authRouter.post('/resend-otp', resendOtp)

authRouter.get('/logout', authUser, logout)

export default authRouter;