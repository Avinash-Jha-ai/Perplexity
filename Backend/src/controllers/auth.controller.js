import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {

    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { email }, { username } ]
    })

    if (isUserAlreadyExists) {
        if (isUserAlreadyExists.verified) {
            return res.status(400).json({
                message: "User with this email or username already exists",
                success: false,
                err: "User already exists"
            })
        }
        
        // If user exists but is NOT verified, we'll update the OTP and proceed
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        isUserAlreadyExists.otp = otp;
        isUserAlreadyExists.otpExpires = otpExpires;
        if (password) isUserAlreadyExists.password = password; // Update password too in case they changed it
        
        await isUserAlreadyExists.save();
        
        await sendEmail({
            to: email,
            subject: "Verify your Perplexity account!",
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #31b8c6; text-align: center;">Verify Your Account</h1>
                        <p style="font-size: 16px; color: #333;">Hi ${isUserAlreadyExists.username},</p>
                        <p style="font-size: 16px; color: #333;">Please use the following OTP to verify your account:</p>
                        <div style="background-color: #31b8c6; color: #ffffff; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0;">
                            ${otp}
                        </div>
                        <p style="font-size: 14px; color: #777; text-align: center;">This code will expire in 10 minutes.</p>
                    </div>
                </div>
            `
        })

        return res.status(200).json({
            message: "User already registered. A new verification code has been sent.",
            success: true,
            user: {
                id: isUserAlreadyExists._id,
                username: isUserAlreadyExists.username,
                email: isUserAlreadyExists.email
            }
        });
    }


    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await userModel.create({
        username,
        email,
        password,
        otp,
        otpExpires
    })

    await sendEmail({
        to: email,
        subject: "Welcome to Perplexity - Verify your account!",
        html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #31b8c6; text-align: center;">Verify Your Account</h1>
                        <p style="font-size: 16px; color: #333;">Hi ${username},</p>
                        <p style="font-size: 16px; color: #333;">Welcome to <strong>Perplexity</strong>! Please use the following OTP (One Time Password) to verify your account:</p>
                        <div style="background-color: #31b8c6; color: #ffffff; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0;">
                            ${otp}
                        </div>
                        <p style="font-size: 14px; color: #777; text-align: center;">This code will expire in 10 minutes.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 14px; color: #999; text-align: center;">If you did not create an account, please ignore this email.</p>
                    </div>
                </div>
        `
    })

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });



}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Incorrect password"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}


/**
 * @desc Verify user's email address using OTP
 * @route POST /api/auth/verify-otp
 * @access Public
 * @body { email, otp }
 */
export async function verifyOtp(req, res) {
    const { email, otp } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (user.verified) {
            return res.status(400).json({
                message: "User is already verified",
                success: false
            })
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP code",
                success: false
            })
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP code has expired",
                success: false
            })
        }

        user.verified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        res.status(200).json({
            message: "Email verified successfully",
            success: true
        })

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false,
            err: err.message
        })
    }
}

/**
 * @desc Resend OTP to user's email
 * @route POST /api/auth/resend-otp
 * @access Public
 * @body { email }
 */
export async function resendOtp(req, res) {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (user.verified) {
            return res.status(400).json({
                message: "User is already verified",
                success: false
            })
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;

        await user.save();

        await sendEmail({
            to: email,
            subject: "New OTP for Perplexity Verification",
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #31b8c6; text-align: center;">New Verification Code</h1>
                        <p style="font-size: 16px; color: #333;">Hi ${user.username},</p>
                        <p style="font-size: 16px; color: #333;">Your new OTP (One Time Password) to verify your account is:</p>
                        <div style="background-color: #31b8c6; color: #ffffff; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0;">
                            ${otp}
                        </div>
                        <p style="font-size: 14px; color: #777; text-align: center;">This code will expire in 10 minutes.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 14px; color: #999; text-align: center;">If you did not request this code, please ignore this email.</p>
                    </div>
                </div>
            `
        })

        res.status(200).json({
            message: "New OTP sent successfully",
            success: true
        })

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false,
            err: err.message
        })
    }
}


/**
 * @desc Logout user and clear cookie
 * @route GET /api/auth/logout
 * @access Private
 */
export async function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.status(200).json({
        message: "Logged out successfully",
        success: true
    })
}