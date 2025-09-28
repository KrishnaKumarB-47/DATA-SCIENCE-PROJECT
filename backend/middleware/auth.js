const User = require('../models/User');

// Middleware to check if user is authenticated
const requireAuth = async (req, res, next) => {
  try {
    // Check if session exists and has userId
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: 'Authentication required. Please log in.'
      });
    }

    // Verify user still exists in database
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      // User was deleted but session still exists
      req.session.destroy();
      return res.status(401).json({
        message: 'User not found. Please log in again.'
      });
    }

    // Add user to request object for use in routes
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional auth middleware - doesn't require authentication but adds user if available
const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue without user if there's an error
    next();
  }
};

// Middleware to check if user owns the resource
const requireOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          message: 'Resource not found'
        });
      }

      // Check if user owns the resource
      if (resource.owner && resource.owner.toString() !== req.session.userId) {
        return res.status(403).json({
          message: 'Access denied. You do not have permission to access this resource.'
        });
      }

      // Check if resource belongs to user (for resources with user field)
      if (resource.user && resource.user.toString() !== req.session.userId) {
        return res.status(403).json({
          message: 'Access denied. You do not have permission to access this resource.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership middleware error:', error);
      res.status(500).json({
        message: 'Authorization error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireOwnership
};
