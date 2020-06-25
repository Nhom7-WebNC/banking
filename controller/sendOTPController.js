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
module.exports = {
  sendOTP: async function (req, res) {
    random = getRandomInt(1000, 9999);
    //update otp to db
    await sendOTPModel.updateOTPCode(230500002, random);
    //sent email otp
    // Le huu nhan dep trai qua a
    //lấy email bằng checkingaccount nhưng mà đoạn này t lười viết
    let accout = await sendOTPModel.findOne("checking_account_number",3000001);
    let email = accout[0].email;
    let transporter = nodemailer.createTransport(mailSender);
    let mailOptions = {
      // should be replaced with real recipient's account
      //thay thế mail bên dưới bằng biến email ở trên
      to: "lehuunhan150698@gmail.com",
      subject: "PPNBank",
      text: "your code is " + random + ". Don't share it; we won't call to ask for it.",
    };
    //
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message %s sent: %s", info.messageId, info.response);
    });

    return res.status(200).send({ message: random });
  },
};
