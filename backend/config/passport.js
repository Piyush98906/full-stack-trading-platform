const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id).select('-password');

          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
