const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token blacklist to store logged-out tokens
const blacklistedTokens = new Set();

// Protect middleware to check for valid tokens
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Check if token is blacklisted
      if (blacklistedTokens.has(token)) {
        return res.status(401).json({ message: 'Token has been logged out' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied, insufficient permissions' });
    }
    next();
  };
};

// Logout middleware to blacklist tokens
const logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    blacklistedTokens.add(token);
  }
  res.status(200).json({ message: 'User logged out successfully' });
};

module.exports = { protect, authorize, logout };
