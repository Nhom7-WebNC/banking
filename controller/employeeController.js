const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
const transactionModel = require("../models/transactionModel");
const express = require("express");
const bcrypt = require("bcryptjs");
var router = express.Router();
module.exports = {
  getAll: async function (req, res, next) {
    const data = userModel.findAll().then((rows) => {
      console.log(rows);
      res.status(200).json({ rows });
    });
  },
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
            accountModel.findCustom("MAX(checking_account_number) as number ").then((rows) => {
              console.log(rows);
              code = parseInt(rows[0].number) + 1;
            });
            userModel.add(newUserMysql).then((rows) => {
              console.log(rows);

              const newAccount = {
                checking_account_number: code,
                user_id: rows.insertId,
              };
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
  getTransaction: async function(req, res, next){
    var activeTab0=[];
    var activeTab1=[];
   
    
    var accountNumber = req.params.accountNumber;
    await transactionModel.findByAccountNumber(accountNumber).then((rows)=>{
      
      rows.map((row)=>
      {
        if (row.receiver_account_number == accountNumber)
        {
          //console.log(row);
          activeTab0.push(row);
        }
        if (row.sender_account_number == accountNumber)
        {
          //console.log(row);
          activeTab1.push(row);
        }
      })
     
    
      
    })

    activeTab1.length && activeTab0.length ? (
      res.status(200).json({data: {activeTab0: activeTab0, activeTab1: activeTab1}})
    ):(
      res.status(401).json({msg: "Tài khoản chưa có giao dịch"})
    )
    
    // res.status(200).json({data: activeTab1})
    
  },
};
