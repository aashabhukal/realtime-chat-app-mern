// src/routes/messageRoutes.js
import express from 'express';
import {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:conversationId', protect, getMessages);
router.put('/:conversationId/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);

export default router;