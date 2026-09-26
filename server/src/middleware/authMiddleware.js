const jwt = require('jsonwebtoken');
const store = require('../storage/jsonStore');

const JWT_SECRET = process.env.JWT_SECRET || 'stocksense_jwt_secret_key_2026_super_secure';

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = store.findById('users', decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User associated with token not found' });
      }

      // Exclude password
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
