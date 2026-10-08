// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token || token === 'null' || token === 'undefined') {
      throw new ApiError(401, 'Not authorized, no token');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    // id, userId, _id teeno support karega
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      console.log("TOKEN PAYLOAD INVALID:", decoded);
      throw new ApiError(401, 'Token me user id nahi hai');
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(401, 'User not found');

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    next(new ApiError(401, 'Not authorized, token failed'));
  }
};