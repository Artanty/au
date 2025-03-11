const jwt = require('jsonwebtoken')
const JWT_SECRET = 'your-secret-key';

/**
 * Middleware to verify JWT
 */
const authenticate = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized, no token in cookies' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the user to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate