// src/routes/authRoutes.js
import express from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ------------------------- PUBLIC ROUTES ------------------------- */
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);

/* ------------------------- PROTECTED ROUTES ------------------------- */
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;