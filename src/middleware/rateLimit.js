// src/middleware/rateLimit.js (አዲስ ፋይል ይፍጠሩ)
const rateLimit = require('express-rate-limit');

// የተለያዩ ሊሚተሮች
const limiters = {
  // ለፐብሊክ ኤፒአይ - ከፍተኛ ገደብ
  public: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // 300 requests per minute
    message: 'Too many requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // ለተረጋገጠ ተጠቃሚ - መጠነኛ ገደብ
  authenticated: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 200,
    message: 'Too many requests, please slow down.',
    keyGenerator: (req) => req.user?.id || req.ip, // በተጠቃሚ መለያ መቁጠር
  }),
  
  // ለሎጂን - ዝቅተኛ ገደብ
  login: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
  }),
  
  // ለከባድ ኦፕሬሽኖች
  heavy: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    message: 'Rate limit exceeded for this operation.',
  }),
};

module.exports = limiters;