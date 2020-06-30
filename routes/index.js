var express = require("express");

const accountModel = require("../models/accountModel");
var router = express.Router();
const sendOTPController = require("../controller/sendOTPController");
const customerController = require("../controller/customerController");
const loginController = require("../controller/loginController");
const jwt = require("jsonwebtoken");
const employeeController = require("../controller/employeeController");
const transactionController = require("../controller/transactionController");
const recceiverListController = require("../controller/recceiverListController");
const config = require("../config/default.json");

router.get("/", authenticateToken, async function (req, res) {
  accountModel.updateCheckingMoney(3000001, 1234);
  res.json("Welcome to userRoute Sucess");
});
router.post("/customers/sendOTP", customer, sendOTPController.sendOTP);
router.post("/customers/dashboard", customer, loginController.resolveToken);
router.post("/customers/transfer", customer, customerController.transfer);
router.get("/customers/infoAccount", customer, customerController.infoAccount);
router.get("/customers/TUBBankDetail", customer, customerController.partnerBankDetail);
router.post("/accounts/receive", customerController.receive);
router.get("/accounts/PPNBankDetail", customerController.myBankDetail);
router.post("/login", loginController.login);
router.post("/signup", loginController.signup);
router.post("/login/me", loginController.resolveToken);
router.post("/employee/create-account", employee, employeeController.createAccount);
router.get("/employee", employee, employeeController.getAll);
router.get("/transaction-history", employee, transactionController.getAll);
router.post("/add-receiver", recceiverListController.add);

router.get("/employee/get-transaction/:accountNumber", employeeController.getTransaction);
function customer(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(403);
  console.log(token);
  jwt.verify(token, config.auth.ACCESS_TOKEN_SECRET, (err, user) => {
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
  jwt.verify(token, config.auth.ACCESS_TOKEN_SECRET, (err, user) => {
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
  jwt.verify(token, config.auth.ACCESS_TOKEN_SECRET, (err, user) => {
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
  jwt.verify(token, config.auth.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(user);
    if (err) return res.sendStatus(403);
    // req.user = user;
    next();
  });
}

module.exports = router;
