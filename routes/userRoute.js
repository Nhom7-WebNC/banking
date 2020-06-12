var express = require("express");
var router = express.Router();
const moment = require("moment");
const config = require("../config/default.json");
var passport = require("passport");
const userModel = require("../models/userModel");
var app = express();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const { promisify } = require("util");
const pool = mysql.createPool(config.mysql);
const pool_query = promisify(pool.query).bind(pool);

/* GET users listing. */
router.get("/", (req, res) => {
  res.json("Welcome to userRoute");
});

router.post("/add", async (req, res) => {
  console.log(req.body);
  try {
    const result = await userModel.add(req.body);
    const ret = {
      // id: result.insertId,
      ...req.body,
      created_at: new Date(),
    };

    delete ret.password;
    res.status(201).json(ret);
  } catch (err) {
    console.log("error: ", err.message);
    return res.status(500).send({ message: "Error." });
  }
});

router.get("/", function (req, res, next) {
  console.log("login");
  if (req.isAuthenticated()) {
    res.redirect("../");
  } else {
    res.render("shop/login");
  }
});
router.post(
  "/signup",
  passport.authenticate("local-signup", {
    successRedirect: "/success",
    failureRedirect: "/fail",
    failureFlash: true,
  })
);

router.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/success",
    failureRedirect: "/fail",
    failureFlash: true,
  })
);

module.exports = router;
