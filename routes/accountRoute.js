var express = require("express");
const moment = require("moment");
const md5 = require("md5");
const hash = require("object-hash");
const NodeRSA = require("node-rsa");
const openpgp = require("openpgp");
const fs = require("fs");
const config = require("../config/default.json");
const process = require("../config/process.config");
const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
const axios = require("axios");
var router = express.Router();
var superagent = require("superagent");
const sendOTPController = require("../controller/sendOTPController");
const customerController = require("../controller/customerController");
const sendOTPModel = require("../models/otpModel");
var nodeoutlook = require("nodejs-nodemailer-outlook");
var nodemailer = require("nodemailer");
var mailSender = require("./../config/mail");
var random;

router.get("/", async function (req, res) {
  accountModel.updateCheckingMoney(3000001, 1234);
  res.json("Welcome to userRoute Sucess");
});
router.post("/sendmoney", sendOTPController.sendOTP);
router.post("/transfer", customerController.transfer);
router.post("/receive", customerController.receive);
router.post("/add", customerController.add);
router.get("/partner", customerController.partner);
router.get("/bank-detail", customerController.bankDetail);

module.exports = router;
