import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config/constants';

export const rateLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
  max: CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10,
  message: {
    status: 'error',
    message: 'Too many test requests, please wait before starting a new test.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
