// src/server.js
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import routes from './routes/index.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import initSocket from './socket/socketHandler.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect DB
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Database Connected"))
.catch((e)=>console.log(e.message))

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static('uploads'));

// Rate limiting - FIXED
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many login attempts, try later.',
});

// app.use('/api', apiLimiter);
// app.use('/api/auth/login', authLimiter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Chat API is running 🚀' });
});

app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Init Socket.IO
const io = initSocket(server);
app.set('io', io);

const PORT = env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export default app;