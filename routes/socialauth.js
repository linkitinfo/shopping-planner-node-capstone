const express = require("express");
const router = express.Router();
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const keys = require("../config/keys");

/**
|--------------------------------------------------
| Mongoose models
|--------------------------------------------------
*/

const User = require("../models/user");

// End of models

/**
|--------------------------------------------------
| GOOGLE AUTH
|--------------------------------------------------
*/

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleKey,
      clientSecret: keys.googleSecret,
      callbackURL: keys.googleCallback
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      const email = profile.emails[0].value;
      User.findOne({ email })
        .then(user => {
          if (user) {
            return done(null, user);
          } else {
            let name = profile.name.givenName + " " + profile.name.familyName;
            const newUser = new User({
              email,
              google: true,
              name,
              active: true
            });
            newUser.save().then(res => {
              return done(null, res);
            });
          }
        })
        .catch(err => done(true, err));
    }
  )
);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
);

// END GOOGLE AUTH  //

/**
|--------------------------------------------------
| FACEBOOK AUTH
|--------------------------------------------------
*/

passport.use(
  new FacebookStrategy(
    {
      clientID: keys.facebookKey,
      clientSecret: keys.facebookSecret,
      callbackURL: keys.facebookCallback,
      profileFields: ["id", "emails", "name"]
    },
    function(accessToken, refreshToken, profile, done) {
      const email = profile.emails[0].value;
      User.findOne({ email })
        .then(user => {
          if (user) {
            return done(null, user);
          } else {
            let name = profile.name.givenName + " " + profile.name.familyName;
            const newUser = new User({
              email,
              facebook: true,
              active: true,
              name
            });
            newUser.save().then(res => {
              return done(null, res);
            });
          }
        })
        .catch(err => done(true, err));
    }
  )
);

router.get(
  "/auth/facebook",
  passport.authorize("facebook", { scope: ["email"] })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);

// END FACEBOOK AUTH //

module.exports = router;
