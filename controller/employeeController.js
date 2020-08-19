const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
const transactionModel = require("../models/transactionModel");
const express = require("express");
const bcrypt = require("bcryptjs");
const moment = require("moment");

var router = express.Router();
module.exports = {
  getAll: async function (req, res, next) {
    const data = userModel.findAll().then((rows) => {
      console.log(rows);
      res.status(200).json({ rows });
    });
  },
  createAccount: function (req, res, next) {
    const password = req.body.password;
    const user = userModel
      .findOne("username", req.body.username)
      .then((rows) => {
        if (rows.length > 0) {
          res.status(403).json({ msg: "Tài khoản đã tồn tại" });
        } else {
          var code;
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async function (err, hash) {
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
              accountModel
                .findCustom("MAX(checking_account_number) as number ")
                .then((rows) => {
                  console.log(rows);
                  code = parseInt(rows[0].number) + 1;

                  userModel.add(newUserMysql).then((rows) => {
                    const newAccount = {
                      checking_account_number: code,
                      user_id: rows.insertId,
                      created_at: moment().format("YYYY-MM-DD"),
                    };
                    console.log(newAccount);
                    accountModel.add(newAccount);
                  });
                });
            });

            return res.status(200).json({ msg: "Tạo tài khoản thành công" });
          });
        }
      });
  },
  getTransaction: async function (req, res, next) {
    var activeTab0 = [];
    var activeTab1 = [];

    var accountNumber = req.params.accountNumber;
    await transactionModel.findByAccountNumber(accountNumber).then((rows) => {
      rows.map((row) => {
        if (row.receiver_account_number == accountNumber) {
          activeTab0.push(row);
        }
        if (row.sender_account_number == accountNumber) {
          activeTab1.push(row);
        }
      });
    });

    activeTab1.length || activeTab0.length
      ? res
          .status(200)
          .json({ data: { activeTab0: activeTab0, activeTab1: activeTab1 } })
      : res.status(401).json({ msg: "Tài khoản chưa có giao dịch" });

  },
  recharge: async function (req, res, next) {
    const data = {
      account: req.body.accountNumber,
      amount: req.body.amount,
    };
    const amount1 = parseInt(data.amount);
    //Kiểm tra tài khoản có tồn tại trong db hay không
    //Nêu có thực hiện chuyển tiền
    const account = await accountModel.findOne(
      "checking_account_number",
      data.account
    );
    // if(amount1==0){
    //   res.status(401).json({msg:"Nhập thiếu thông tin"});
    // }
    if (account.length <= 0) {
      res.status(403).json({ msg: "Tài khoản không tồn tại" });
    }
    else {
      //lấy số dư hiện tại từ account number
      const account_use = account[0];
      const current_amount = account_use.checking_account_amount;
      accountModel.updateCheckingMoney(
        account_use.checking_account_number,
        current_amount + amount1
      );
      res.status(201).json({ msg: "Nạp tiền thành công" });
    }
  },
};
