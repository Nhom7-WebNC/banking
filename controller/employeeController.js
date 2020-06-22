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
        var code;
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
            //create checking number
            accountModel.findCustom('MAX(checking_account_number) as number ').then((rows) => {
              console.log(rows);
              code = parseInt(rows[0].number) + 1;



            })
            userModel.add(newUserMysql).then((rows) => {
              console.log(rows);

              const newAccount = {
                checking_account_number: code,
                user_id: rows.insertId,

              }
              console.log(newAccount);
              accountModel.add(newAccount);
            });



            userModel.add(newUserMysql);

            return res.status(200).json("dang ki thanh cong" + { newUserMysql });
          });
        });
      }
    });


  },
  
}
