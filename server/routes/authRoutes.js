import express from "express";
import { login, logout, register, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword, sendVerifyOtpPublic, verifyEmailPublic } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-email', userAuth, verifyEmail);
// Public endpoints for post-register email verification
authRouter.post('/send-verify-otp-public', sendVerifyOtpPublic);
authRouter.post('/verify-email-public', verifyEmailPublic);
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;