// config/passport.js

// load all the things we need
var LocalStrategy = require("passport-local").Strategy;
var rd = require("randomstring");
// load up the user model

const userModel = require("../models/userModel");

var bcrypt = require("bcryptjs");
// var con = require("./../config/key");
const db = require("./../utils/db");

const mysql = require("mysql");
const { promisify } = require("util");
const config = require("../config/default.json");

const pool = mysql.createPool(config.mysql);
const pool_query = promisify(pool.query).bind(pool);
const moment = require("moment");
const saltRounds = 10;
// expose this function to our app using module.exports
module.exports = function (passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  // used to deserialize the user
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: "username",
        passwordField: "password",

        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      function (req, username, password, done) {
        let phone_number = req.body.phone_number;
        let address = req.body.address;
        let name = req.body.name;
        let email = req.body.email;
        let gender = req.body.gender;
        let personal_number = req.body.personal_number;
        let role_name = req.body.role_name;
        let birthday = req.body.birthday;
        let create_at = moment().format("YYYY-MM-DD");
        let option = {
          min: 100000,
          max: 999999,
          integer: true,
        };
        const key = rd.generate();
        console.log(username + password + phone_number + address + name);
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        pool_query(
          "SELECT * FROM user WHERE username = ? or email = ? or phone_number = ?",
          [username, email, phone_number],
          function (err, rows) {
            console.log(rows);
            if (err) {
              console.log(err.message);
              return done(err);
            }
            if (rows.length < 0) {
              console.log("is already");
              return done(null, false, req.flash("signupMessage", "That username is already taken."));
            } else {
              // if there is no user with that username
              // create the user
              bcrypt.genSalt(10, async (err, salt) => {
                await bcrypt.hash(password, salt, function (err, hash) {
                  console.log(hash + "...");
                  console.log(password + ".....");
                  passwordHash = hash;

                  var newUserMysql = {
                    id: null,
                    // key: key,
                    email: email,
                    username: username,
                    password: passwordHash,
                  };
                  userModel.add(newUserMysql);
                });
              });

              // var insertQuery = "INSERT INTO customers ( username, password ) values (?,?)";

              //   var insertQuery =
              //     "INSERT INTO user (username,password, name, phone_number,email,birthday,address,gender,role_name,personal_number,created_at) values (?,?,?,?,?,?,?,?,?,?,?)";
              //   pool_query(insertQuery, [
              //     name,
              //     phone_number,
              //     address,
              //     email,
              //     gender,
              //     personal_number,
              //     role_name,
              //     birthday,
              //     create_at,
              //   ]);
              //   pool_query("SELECT * FROM user WHERE username = ?", [username], function (err, rows) {
              //     console.log("abc");
              //     console.log(rows);
              //     newUserMysql.id = rows[0].id;

              //     return done(null, newUserMysql);
              //   });
            }
          }
        );
      }
    )
  );

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      function (req, username, password, done) {
        // callback with email and password from our form
        console.log(username + password);

        pool_query("SELECT * FROM user WHERE username = ?  ", [username], function (err, rows) {
          if (err) {
            console.log("error");
            return done(err);
          }
          if (!rows.length) {
            console.log("not user");
            return done(null, false, { message: "No user found." }); // req.flash is the waysds to set flashdata using pool_querynect-flash
          }
          console.log("rows0");
          console.log(rows[0]);
          bcrypt.compare(password, rows[0].password, function (err, res) {
            if (err) {
              // handle error
              console.log("error");
            }
            if (res) {
              console.log("chuan");
              // Send JWT
            } else {
              // response is OutgoingMessage object that server response http request
              console.log("els");
            }
          });

          // all is well, return successful user
          return done(null, rows[0]);
        });
      }
    )
  );
};
