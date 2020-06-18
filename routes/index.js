var express = require("express");
const moment = require("moment");
const md5 = require("md5");
const hash = require("object-hash");
const NodeRSA = require("node-rsa");
const openpgp = require("openpgp");
const fs = require("fs");
const config = require("../config/default.json");
const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
const axios = require("axios");
var router = express.Router();
var superagent = require("superagent");
const sendOTPController = require("../controller/sendOTPController");
const customerController = require("../controller/customerController");
const loginController = require("../controller/loginController");
const jwt = require("jsonwebtoken");
const employeeController = require("../controller/employeeController");

router.get("/", authenticateToken, async function (req, res) {
  accountModel.updateCheckingMoney(3000001, 1234);
  res.json("Welcome to userRoute Sucess");
});
router.post("/customers/sendmoney", customer, sendOTPController.sendOTP);
router.post("/customers/transfer", customer, customerController.transfer);
router.get("/customers/TUBBankDetail", customer, customerController.partnerBankDetail);
router.post("/accounts/receive", customerController.receive);
router.get("/accounts/PPNBankDetail", customerController.myBankDetail);
router.post("/login", loginController.login);
router.post("/signup", loginController.signup);
router.post("/employee/create-account", employee, employeeController.createAccount);

function customer(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(403);
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    if (user.role_name == "customer") {
      req.user = user;
      next();
    } else {
      res.sendStatus(403);
    }
  });
  return;
}

function employee(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(403);
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    if (user.role_name == "employee") {
      req.user = user;
      next();
    } else {
      res.sendStatus(403);
    }
  });
  return;
}
function admin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(403);
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    if (user.role_name == "admin") {
      req.user = user;
      next();
    } else {
      res.sendStatus(403);
    }
  });
  return;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(user);
    if (err) return res.sendStatus(403);
    // req.user = user;
    next();
  });
}

module.exports = router;
