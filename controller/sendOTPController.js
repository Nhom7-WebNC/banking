const sendOTPModel = require("../models/otpModel");
var nodemailer = require("nodemailer");
var mailSender = require("../config/mail");
const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
var random;
getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};
module.exports = {
  sendOTP: async function (req, res) {
    random = getRandomInt(1000, 9999);
    //update otp to db
    await sendOTPModel.updateOTPCode(req.body.account_number, random);
    console.log("acc", req.body.account_number);
    //sent email otp
    // Le huu nhan dep trai qua a
    //lấy email bằng checkingaccount nhưng mà đoạn này t lười viết
    let account = await accountModel.findOne("checking_account_number", req.body.account_number);
    let user = await userModel.findOne("id", account[0].user_id);
    let email = user[0].email;
    console.log("email", email);
    let transporter = nodemailer.createTransport(mailSender);
    let mailOptions = {
      // should be replaced with real recipient's account
      //thay thế mail bên dưới bằng biến email ở trên
      to: email,
      subject: "PPNBank",
      text: "your code is " + random + ". Don't share it; we won't call to ask for it.",
    };
    //
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(400);
      }
      console.log("Message %s sent: %s", info.messageId, info.response);
    });

    return res.status(200).send({ msg: random });
  },
};
