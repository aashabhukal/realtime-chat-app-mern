// src/models/Message.js
import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    reactedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    /* ------------------------- RELATIONS ------------------------- */
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // group chat me null hoga
    },

    /* ------------------------- CONTENT ------------------------- */
    content: {
      type: String,
      trim: true,
      default: '',
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
      default: 'text',
    },

    /* ------------------------- FILE ATTACHMENT ------------------------- */
    file: {
      url: { type: String, default: '' },
      name: { type: String, default: '' },
      size: { type: Number, default: 0 }, // bytes me
      mimeType: { type: String, default: '' },
      duration: { type: Number, default: 0 }, // audio/video ke liye (seconds)
    },

    // ✅ Multiple attachments bhi support karne ke liye (backward compatible)
    attachments: [
      {
        url: String,
        type: { type: String, enum: ['image', 'file', 'audio', 'video'] },
        name: String,
        size: { type: Number, default: 0 },
        mimeType: String,
      },
    ],

    /* ------------------------- READ / DELIVERED ------------------------- */
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },

    // Multiple users ke liye (group chat read receipts)
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    /* ------------------------- EDIT / DELETE ------------------------- */
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    /* ------------------------- REACTIONS ------------------------- */
    reactions: [reactionSchema],

    /* ------------------------- REPLY ------------------------- */
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },

    /* ------------------------- FLAGS ------------------------- */
    isForwarded: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* =================================================================== */
/*                          INDEXES                                    */
/* =================================================================== */
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ content: 'text' }); // full-text search ke liye

/* =================================================================== */
/*                          VIRTUALS                                   */
/* =================================================================== */
messageSchema.virtual('reactionCount').get(function () {
  return this.reactions?.length || 0;
});

messageSchema.virtual('isReply').get(function () {
  return !!this.replyTo;
});

/* =================================================================== */
/*                          METHODS                                    */
/* =================================================================== */

// Mark message as read
messageSchema.methods.markAsRead = function (userId) {
  if (!this.readBy.some((id) => id.toString() === userId.toString())) {
    this.readBy.push(userId);
  }
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Mark message as delivered
messageSchema.methods.markAsDelivered = function (userId) {
  if (!this.deliveredTo.some((id) => id.toString() === userId.toString())) {
    this.deliveredTo.push(userId);
  }
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

// Add reaction
messageSchema.methods.addReaction = function (userId, emoji) {
  const existing = this.reactions.find(
    (r) => r.user.toString() === userId.toString()
  );
  if (existing) {
    existing.emoji = emoji;
    existing.reactedAt = new Date();
  } else {
    this.reactions.push({ user: userId, emoji });
  }
  return this.save();
};

// Remove reaction
messageSchema.methods.removeReaction = function (userId) {
  this.reactions = this.reactions.filter(
    (r) => r.user.toString() !== userId.toString()
  );
  return this.save();
};

// Soft delete (for everyone or for specific user)
messageSchema.methods.softDelete = function (userId, forEveryone = false) {
  if (forEveryone) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.content = 'This message was deleted';
    this.file = { url: '', name: '', size: 0, mimeType: '', duration: 0 };
    this.attachments = [];
  } else {
    if (!this.deletedFor.some((id) => id.toString() === userId.toString())) {
      this.deletedFor.push(userId);
    }
  }
  return this.save();
};

// Edit message
messageSchema.methods.editContent = function (newContent) {
  this.content = newContent;
  this.edited = true;
  this.editedAt = new Date();
  return this.save();
};

// Check if user can see this message
messageSchema.methods.isVisibleTo = function (userId) {
  return !this.deletedFor.some((id) => id.toString() === userId.toString());
};

/* =================================================================== */
/*                          STATICS                                    */
/* =================================================================== */

// Get unread count for a conversation
messageSchema.statics.getUnreadCount = function (conversationId, userId) {
  return this.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    readBy: { $ne: userId },
    deleted: false,
  });
};

// Mark all messages in conversation as read
messageSchema.statics.markAllAsRead = function (conversationId, userId) {
  return this.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    },
    {
      $addToSet: { readBy: userId },
      isRead: true,
      readAt: new Date(),
    }
  );
};

export default mongoose.model('Message', messageSchema);