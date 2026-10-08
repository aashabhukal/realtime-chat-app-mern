// src/services/authService.js

import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import { sendOTPEmail } from "./emailService.js";

export const registerUser = async ({ name, username, email, password }) => {
  if (!name || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  name = name.trim();
  username = username.trim().toLowerCase();
  email = email.trim().toLowerCase();

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    // Agar user pehle se verified hai, to error do
    if (existing.isVerified) {
      if (existing.email === email) throw new ApiError(400, "Email already registered");
      if (existing.username === username) throw new ApiError(400, "Username already taken");
    } else {
      // Agar user ne pehle register kiya tha lekin OTP verify nahi kiya,
      // to purana unverified user delete karke naya banane do
      console.log(`Deleting unverified user: ${existing.email}`);
      await User.deleteOne({ _id: existing._id });
    }
  }

  const user = await User.create({ name, username, email, password, isVerified: false });
  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });
  console.log(`\n📧 OTP for ${user.email}: ${otp}\n`);
  try { await sendOTPEmail(user.email, user.name, otp); } catch (err) { console.error("OTP email failed:", err.message); }

  return {
    _id: user._id, name: user.name, username: user.username, email: user.email,
    isVerified: false, message: "OTP sent to your email. Please verify to continue.",
  };
};

export const verifyOTP = async ({ email, otp }) => {
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");
  email = email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+otp +otpExpires +otpAttempts +otpLockUntil +otpLockLevel +otpResendCount");
  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Account already verified");
  try { await user.verifyOTP(otp); } catch (err) { throw new ApiError(400, err.message); }
  return {
    _id: user._id, name: user.name, username: user.username, email: user.email,
    avatar: user.avatar, bio: user.bio, isVerified: user.isVerified, token: generateToken(user._id),
  };
};

export const resendOTP = async ({ email }) => {
  if (!email) throw new ApiError(400, "Email is required");
  email = email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+otp +otpExpires +otpAttempts +otpLockUntil +otpLockLevel +otpResendCount");
  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Account already verified");
  if (user.isLocked()) throw new ApiError(429, `Account locked. Try again in ${Math.ceil(user.getLockRemaining() / 60)} min(s).`);
  if ((user.otpResendCount || 0) >= 5) throw new ApiError(429, "Max resend limit reached. Try again later.");
  const otp = user.generateOTP();
  user.otpResendCount = (user.otpResendCount || 0) + 1;
  await user.save({ validateBeforeSave: false });
  console.log(`\n📧 OTP RESENT for ${user.email}: ${otp}\n`);
  try { await sendOTPEmail(user.email, user.name, otp); } catch (err) { console.error("Resend OTP email failed:", err.message); }
  return { message: "OTP resent successfully" };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }
  email = email.trim().toLowerCase();
  const user = await User.findOne({ email }).select(
    "+password +otp +otpExpires +otpAttempts +otpLockUntil +otpLockLevel +otpResendCount"
  );
  if (!user) throw new ApiError(401, "Invalid credentials");
  const passwordMatch = await user.matchPassword(password);
  if (!passwordMatch) throw new ApiError(401, "Invalid credentials");

  if (!user.isVerified) {
    if ((user.otpResendCount || 0) >= 5) throw new ApiError(429, "Maximum OTP resend limit reached. Please try again later.");
    const otp = user.generateOTP();
    user.otpResendCount = (user.otpResendCount || 0) + 1;
    await user.save({ validateBeforeSave: false });
    console.log(`\n📧 OTP (login unverified) for ${user.email}: ${otp}\n`);
    try { await sendOTPEmail(user.email, user.name, otp); } catch (err) { console.error("Login OTP email failed:", err.message); }
    throw new ApiError(403, "Account not verified. A new OTP has been sent to your email.");
  }

  user.isOnline = true;
  user.status = "online";
  await user.save({ validateBeforeSave: false });

  return {
    _id: user._id, name: user.name, username: user.username, email: user.email,
    avatar: user.avatar, bio: user.bio, status: user.status,
    isVerified: user.isVerified, isOnline: user.isOnline, token: generateToken(user._id),
  };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { isOnline: false, status: "offline", lastSeen: new Date(), socketId: null });
};