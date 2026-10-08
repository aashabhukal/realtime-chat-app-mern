// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-z0-9_.]+$/,
        'Username can only contain letters, numbers, underscore and dot',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    avatar: { type: String, default: '' },
    bio: {
      type: String,
      default: 'Hey there! I am using Chat App.',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away', 'busy', 'invisible'],
      default: 'offline',
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false, default: null },
    otpExpires: { type: Date, select: false, default: null },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLockUntil: { type: Date, default: null, select: false },
    otpLockLevel: { type: Number, default: 0, select: false },
    otpResendCount: { type: Number, default: 0, select: false },
    verificationToken: { type: String, select: false },
    verificationExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    socketId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ friends: 1 });
userSchema.index({ blockedUsers: 1 });

userSchema.virtual('friendCount').get(function () {
  return this.friends?.length || 0;
});

userSchema.virtual('isBlocked').get(function () {
  return this.blockedUsers?.length > 0;
});

/* PRE-SAVE HOOK - FINAL FIX (no next) */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.hasBlocked = function (userId) {
  return this.blockedUsers.some((id) => id.toString() === userId.toString());
};

userSchema.methods.isBlockedBy = function (userId) {
  return this.blockedBy.some((id) => id.toString() === userId.toString());
};

userSchema.methods.isFriend = function (userId) {
  return this.friends.some((id) => id.toString() === userId.toString());
};

userSchema.methods.hasSentRequest = function (userId) {
  return this.sentRequests.some((id) => id.toString() === userId.toString());
};

userSchema.methods.hasIncomingRequest = function (userId) {
  return this.friendRequests.some(
    (req) => req.from.toString() === userId.toString()
  );
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    username: this.username,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    status: this.status,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    isVerified: this.isVerified,
    friendCount: this.friends?.length || 0,
    createdAt: this.createdAt,
  };
};

userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  this.otpAttempts = 0;
  return otp;
};

userSchema.methods.verifyOTP = async function (enteredOtp) {
  if (this.otpLockUntil && this.otpLockUntil > new Date()) {
    const mins = Math.ceil((this.otpLockUntil - new Date()) / 60000);
    throw new Error(`Account locked. Try again in ${mins} minute(s).`);
  }
  if (!this.otp || !this.otpExpires) {
    throw new Error('No OTP requested. Please request a new one.');
  }
  if (this.otpExpires < new Date()) {
    throw new Error('OTP expired. Please request a new one.');
  }
  if (this.otp !== enteredOtp) {
    this.otpAttempts += 1;
    if (this.otpAttempts >= 3) {
      this.otpLockLevel += 1;
      const lockProgression = [0, 1, 5, 10, 20, 40, 60];
      const lockMinutes =
        lockProgression[this.otpLockLevel] !== undefined
          ? lockProgression[this.otpLockLevel]
          : 60;
      this.otpLockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      this.otpAttempts = 0;
      await this.save({ validateBeforeSave: false });
      throw new Error(
        `Too many wrong attempts. Account locked for ${lockMinutes} minute(s).`
      );
    }
    await this.save({ validateBeforeSave: false });
    throw new Error(
      `Invalid OTP. ${3 - this.otpAttempts} attempt(s) remaining.`
    );
  }
  this.isVerified = true;
  this.otp = null;
  this.otpExpires = null;
  this.otpAttempts = 0;
  this.otpLockUntil = null;
  this.otpLockLevel = 0;
  this.otpResendCount = 0;
  await this.save({ validateBeforeSave: false });
  return true;
};

userSchema.methods.isLocked = function () {
  return this.otpLockUntil && this.otpLockUntil > new Date();
};

userSchema.methods.getLockRemaining = function () {
  if (!this.isLocked()) return 0;
  return Math.ceil((this.otpLockUntil - new Date()) / 1000);
};

userSchema.statics.findByEmailOrUsername = function (identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() },
    ],
  });
};

export default mongoose.model('User', userSchema);