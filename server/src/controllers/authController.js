// src/controllers/authController.js
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as authService from '../services/authService.js';

/* ------------------------- REGISTER ------------------------- */
// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, data, 'Registered. OTP sent to email.'));
});

/* ------------------------- VERIFY OTP ------------------------- */
// POST /api/auth/verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const data = await authService.verifyOTP(req.body);
  res.json(new ApiResponse(200, data, 'Account verified successfully'));
});

/* ------------------------- RESEND OTP ------------------------- */
// POST /api/auth/resend-otp
export const resendOtp = asyncHandler(async (req, res) => {
  const data = await authService.resendOTP(req.body);
  res.json(new ApiResponse(200, data, 'OTP resent successfully'));
});

/* ------------------------- LOGIN ------------------------- */
// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  res.json(new ApiResponse(200, data, 'Logged in successfully'));
});

/* ------------------------- LOGOUT ------------------------- */
// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  res.json(new ApiResponse(200, null, 'Logged out successfully'));
});

/* ------------------------- GET ME ------------------------- */
// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user, 'Current user'));
});