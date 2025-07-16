const { clearHash } = require("../services/cache");

module.exports = (req, res, next) => {
  // Store the original res.send function
  const originalSend = res.send;

  // Override res.send to clear cache after response is sent
  res.send = function(...args) {
    // Call the original send function
    const result = originalSend.apply(this, args);
    
    // Clear cache after response is sent
    if (req.user && req.user.id) {
      clearHash(req.user.id);
    }
    
    return result;
  };

  // Continue to next middleware
  next();
};
