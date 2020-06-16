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

router.get("/", authenticateToken, async function (req, res) {
  accountModel.updateCheckingMoney(3000001, 1234);
  res.json("Welcome to userRoute Sucess");
});
router.post("/sendmoney", authenticateToken, sendOTPController.sendOTP);
router.post("/transfer", authenticateToken, customerController.transfer);
router.post("/receive", customerController.receive);
router.post("/add", customer, customerController.add);
router.get("/accounts/TUBBankDetail", customerController.partnerBankDetail);
router.get("/accounts/PPNBankDetail", customerController.myBankDetail);
router.post("/login", loginController.login);
router.post("/signup", loginController.signup);

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

function admin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    console.log(user);
    if (user.role_name == "admin") {
      req.user = user;
      next();
    }
    // res.sendStatus(403).json({ msg: " khong phai admin" });
  });
}

function customer(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.role_name == "customer") {
      req.user = user;
      next();
    }
    res.sendStatus(403);
  });
}

function employee(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.role_name == "employee") {
      req.user = user;
      next();
    }
    res.sendStatus(403).json({ msg: "Khong phai employee" });
  });
}

module.exports = router;
