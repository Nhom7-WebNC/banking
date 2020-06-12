var express = require("express");
var router = express.Router();
const sendOTPModel = require("../models/otpModel");
var nodeoutlook = require("nodejs-nodemailer-outlook");
var nodemailer = require("nodemailer");
var mailSender = require("./../config/mail");
var random;
getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};
router.sendOTP = async function (req, res) {};
module.exports = router;
