var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: "156451254536980",
    clientSecret: "ead5dade3d1a8d8e788e4299e21ad77a",
    callbackURL: "http://cortezcristian-chat-demo.jit.su/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  }
));
