import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getConversations,
  createConversation,
  getConversationById,
} from '../controllers/conversationController.js';

const router = express.Router();

// Sab routes protected hain - login zaroori hai
router.use(protect);

router.route('/')
  .get(getConversations)      // GET /api/conversations -> saari chats
  .post(createConversation);  // POST /api/conversations

router.route('/:id')
  .get(getConversationById);  // GET /api/conversations/:id

export default router;