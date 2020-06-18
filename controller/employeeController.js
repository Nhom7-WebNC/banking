const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
const express = require("express");
const bcrypt = require("bcryptjs");
var router = express.Router();
module.exports = {
  createAccount: async function (req, res, next) {
    const password = req.body.password;
    const user = userModel.findOne("username", req.body.username).then((rows) => {
      if (rows.length > 0) {
        res.status(403).json({ msg: "tai khoan da ton tai" });
      } else {
        bcrypt.genSalt(10, async (err, salt) => {
          bcrypt.hash(password, salt, function (err, hash) {
            passwordHash = hash;

            const newUserMysql = {
              username: req.body.username,
              password: passwordHash,
              name: req.body.name,
              phone_number: req.body.phone_number,
              email: req.body.email,
              birthday: req.body.birthday,
              address: req.body.address,
              gender: req.body.gender,
              role_name: req.body.role_name,
              personal_number: req.body.personal_number,
            };
            userModel.add(newUserMysql);

            return res.status(200).json("dang ki thanh cong" + { newUserMysql });
          });
        });
      }
    });
  },
};
