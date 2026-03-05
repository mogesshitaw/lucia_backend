const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
      issuer: 'lucia-printing',
      audience: 'lucia-printing-users'
    }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      tokenVersion: user.tokenVersion || 0
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      issuer: 'lucia-printing',
      audience: 'lucia-printing-users'
    }
  );

  // Calculate expiration time in seconds
  const decoded = jwt.decode(accessToken);
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

  return {
    accessToken,
    refreshToken,
    expiresIn
  };
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'lucia-printing',
      audience: 'lucia-printing-users'
    });
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'lucia-printing',
      audience: 'lucia-printing-users'
    });
  } catch (error) {
    return null;
  }
};

const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken
};