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
const debtReminderController = require("../controller/debtReminderController");
const config = require("../config/default.json");
const adminController = require("../controller/adminController");

router.get("/", authenticateToken, async function (req, res) {
  accountModel.updateCheckingMoney(3000001, 1234);
  res.json("Welcome to userRoute Sucess");
});

//Đăng nhập
router.post("/login", loginController.login);

//refresh token
router.post("/login/getToken", loginController.getToken);

//Lấy thông tin customer
router.get("/customers/infoAccount", customer, customerController.infoAccount);

//xem các tài khoản của user hiện tại
router.post("/customers/getAccount", customer, customerController.getAccount);

//gửi mã OTP
router.post("/customers/sendOTP", customer, sendOTPController.sendOTP);

//lấy thông tin user của ngân hàng mình
router.post("/accounts/PPNBankDetail", customerController.myBankDetail);
//Chuyển tiền cùng ngân hàng
router.post("/customers/transferSameBank", customer, customerController.TransferSameBank);

//Lấy thông tin của tài khoản ngân hàng đối tác
router.get("/customers/TUBBankDetail", customer, customerController.partnerBankDetail);
//Chuyển tiền khác ngân hàng
router.post("/customers/transfer", customer, customerController.TransferOtherBank);

//Xử lý nhận tiền
router.post("/accounts/receive", customerController.receive);

//tạo tài khoản cho khách hàng
router.post("/employee/create-account", employee, employeeController.createAccount);

//lấy danh sách nhân viên
router.get("/employee", employee, employeeController.getAll);

//xem tất cả lịch sử giao dịch
router.get("/transaction-history", employee, transactionController.getAll);

//Xem lịch sử giao dịch của tài khoản nào đó
router.get("/employee/get-transaction/:accountNumber", employeeController.getTransaction);

//Thên người nhận cho user nào đó ( truyền vào user_id và {account người nhận , tên gợi nhớ, ngân hàng người nhận})
router.post("/add-receiver", recceiverListController.add);

//quản lý nhân viên
router.get("/admin/manage-employee",adminController.manager);
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
