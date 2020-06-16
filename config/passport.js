// config/passport.js
require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

// expose this function to our app using module.exports
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (username, password, cb) => {
      return userModel
        .findOne("username", username)
        .then((rows) => {
          if (rows.length === 0) {
            return cb(null, false, { msg: "Invalid account" });
          }

          var user = rows[0];
          var comparePassword = bcrypt.compare(password, rows[0].password);
          // console.log("cb", cb);
          // console.log(comparePassword);
          if (comparePassword) {
            console.log(comparePassword + "true");
            return cb(null, user);
          }

          return cb(null, false, { msg: "Wrong password" });
        })
        .catch((error) => {
          return cb(error);
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("Authorization"),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    },
    (jwtPayload, cb) => {
      console.log("hii");
      return userModel
        .findOne("username", jwtPayload.username)
        .then((user) => {
          return cb(null, user[0]);
        })
        .catch((error) => {
          return cb(error);
        });
    }
  )
);
// passport.use(
//   new JWTStrategy(
//     {
//       jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.ACCESS_TOKEN_SECRET,
//     },
//     (token, done) => {
//       console.log(token);
//       return done(null, token);
//     }
//   )
// );
