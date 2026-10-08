import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import messageRoutes from './messageRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', protect, userRoutes);
router.use('/conversations', protect, conversationRoutes); // 👈 
router.use('/messages', protect, messageRoutes);

export default router;