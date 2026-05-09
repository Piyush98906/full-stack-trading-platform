const passport = require('passport');

const protect = passport.authenticate('jwt', { session: false });

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
};

module.exports = { protect, adminOnly };
