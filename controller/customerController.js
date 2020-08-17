const accountModel = require("../models/accountModel");
const otpModel = require("../models/otpModel");
const transactionModel = require("../models/transactionModel");
const debtModel = require("../models/debtReminderModel");

const receiverModel = require("../models/receiverModel");
var mailSender = require("../config/mail");
const config = require("../config/default.json");
const process = require("../config/process.config");
const NodeRSA = require("node-rsa");
var superagent = require("superagent");
const hash = require("object-hash");
const moment = require("moment");
const crypto = require("crypto");
const openpgp = require("openpgp");
const axios = require("axios");
const kbpgp = require("kbpgp");
const fs = require("fs");

var row = {};

const userModel = require("../models/userModel");
const { updateCheckingMoney } = require("../models/accountModel");
const { resolveSoa } = require("dns");
const { SSL_OP_SINGLE_ECDH_USE } = require("constants");
const { json } = require("express");
const confirm = (req) => {
  console.log("header", req.headers);
  const ts = req.headers.ts;
  const bank_code = req.get("bank_code");
  const sig = req.headers.sig;
  const secret = req.headers.secret;
  const currentTime = moment().valueOf();
  console.log(currentTime);
  console.log(config.auth.partnerRSA);
  console.log("m partCode", bank_code);
  console.log("m partCode2", JSON.stringify(req.body));
  console.log("m partCode3", secret);

  if (currentTime - ts > config.auth.expireTime) {
    console.log("return 1");
    return 1;
  }

  if (bank_code != config.auth.partnerRSA && bank_code != config.auth.partnerPGP) {
    console.log("return 2");
    return 2;
  }

  const comparingSign = hash.MD5(ts + JSON.stringify(req.body) + config.auth.secret);
  // const comparingSign = "8685a1e0c9a64edb138216e66188fb17";
  if (sig != comparingSign) {
    console.log(comparingSign);
    console.log("return 3");
    return 3;
  }

  // if (!req.body.transferer) {
  //   console.log("return 4");
  //   return 4;
  // }
  // hashSecretKey = md5(config.auth.secret);
  //  sig = md5(bank_code + ts + JSON.stringify(testbody) + hashSecretKey);
};
module.exports = {
  //get tài khoản của user
  getAccount: async function (req, res) {
    const user = await userModel.findOne("username", req.body.username);
    if (user.length <= 0) {
      res.status(400).json({ msg: "user khong ton tai" });
      return;
    }
    const accounts = await accountModel.findOne("user_id", user[0].id);
    if (accounts.length <= 0) {
      res.status(400).json({
        msg: "username " + req.body.username + " chua co tai khoan nao",
      });
      return;
    }
    account = accounts[0];
    console.log(accounts);
    res.status(200).json(account);
    return;
  },

  //Chuyển tiền cùng ngân hàng

  //------------------------------lấy info account -------------------------------------------------
  infoAccount: async function (req, res) {
    const userId = userModel.findOne("username", req.body.username).then((rows) => {
      console.log("userid", rows[0].id);

      if (rows.length <= 0) {
        return res.status(401).json({ msg: "Nhap sai ten" });
      }
      const account = accountModel.findOne("user_id", rows[0].id).then((rows2) => {
        const row = rows2[0];
        console.log("userid", row);

        if (!row) {
          return res.status(401).json({ msg: "nguoi dung chua tao tai khoan" });
        }

        const data = {
          checking_account_number: row.checking_account_number,
          checking_account_amount: row.checking_account_amount,
        };
        console.log(data);
        res.status(200).json({ data: data });
      });
    });
  },
  //------------------------------lấy info account -------------------------------------------------

  add: async function (req, res) {
    try {
      const rows = await userModel.findOne("id", req.body.user_id);

      if (rows.length == 0) {
        return res.status(403).send({ message: `No user has id ${req.body.user_id}` });
      } else {
        const newAccount = {
          checking_account_number: "23050000" + req.body.user_id,
          user_id: req.body.user_id,
          checking_account_amount: req.body.balance,
          created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };

        try {
          const ret = await accountModel.add(newAccount);
          return res.status(200).send(ret);
        } catch (err) {
          console.log("error: ", err.message);
          return res.status(500).send({ message: "Error." });
        }
      }
    } catch (err) {
      console.log("error: ", err.message);
      return res.status(500).send({ message: "Error." });
    }
  },

  generatePGP: async function (req, res) {
    console.log("phong");
    var F = kbpgp["const"].openpgp;

    var opts = {
      userid: "User McTester (Born 1979) <user@example.com>",
      primary: {
        nbits: 4096,
        flags: F.certify_keys | F.sign_data | F.auth | F.encrypt_comm | F.encrypt_storage,
        expire_in: 0, // never expire
      },
      subkeys: [
        {
          nbits: 2048,
          flags: F.sign_data,
          expire_in: 86400 * 365 * 8, // 8 years
        },
        {
          nbits: 2048,
          flags: F.encrypt_comm | F.encrypt_storage,
          expire_in: 86400 * 365 * 8,
        },
      ],
    };

    kbpgp.KeyManager.generate(opts, function (err, alice) {
      if (!err) {
        // sign alice's subkeys
        alice.sign({}, function (err) {
          console.log(alice);
          // export demo; dump the private with a passphrase
          alice.export_pgp_private(
            {
              passphrase: "phongledeptrai!",
            },
            function (err, pgp_private) {
              console.log("private key: ", pgp_private);
            }
          );
          alice.export_pgp_public({}, function (err, pgp_public) {
            console.log("public key: ", pgp_public);
          });
        });
      }
    });
  },

  //------------------------------lịch sử giao dịch---------------------------------------
  getTransaction: async function (req, res, next) {
    var activeTab0 = [];
    var activeTab1 = [];
    var activeTab2 = [];

    const accountNumber = req.body.accountNumber;
    await debtModel.findByAccountNumber(accountNumber).then((rows) => {
      rows.map((row) => {
        if (row.status >= 1) {
          activeTab2.push(row);
        }
      });
    });
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
      ? res.status(200).json({ data: { activeTab0: activeTab0, activeTab1: activeTab1, activeTab2: activeTab2 } })
      : res.status(401).json({ msg: "Tài khoản chưa có giao dịch" });

    // res.status(200).json({data: activeTab1})
  },
};
