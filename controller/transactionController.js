const transactionModel = require("../models/transactionModel");
const express = require("express");
const bcrypt = require("bcryptjs");
const accountModel = require("../models/accountModel");
const otpModel = require("../models/otpModel");
const userModel = require("../models/userModel");
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
var router = express.Router();
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
  partnerBankDetail: async function (req, res) {
    const body = req.body;
    console.log("body", body);
    const bank_code = config.auth.bankcode;

    const ts = Date.now();
    const sig = hash.MD5(bank_code + ts + JSON.stringify(body) + config.auth.secretPartnerRSA);
    const headers = { bank_code, sig, ts };

    const partner = req.body.partner_bank;

    switch (partner) {
      case "TUB":
        superagent
          .post(`${config.auth.apiRoot}/bank-detail`)
          .send(body)
          .set(headers)
          .end((err, result) => {
            if (err) {
              return res.status(401).json({ msg: "khong tim thay tai khoan nay" });
            }
            console.log(result);
            const resu = JSON.parse(result.text).name;
            return res.status(201).json({ resu });
          });
        break;
      case "partner34":
        const time = moment().valueOf();
        const hash2 = crypto
          .createHash("sha256")
          .update(time + config.auth.secret)
          .digest("hex");
        const code = config.auth.bankcode;
        const configAxios = {
          headers: {
            "x-time": time,
            "x-partner-code": code,
            "x-signature": hash2,
          },
        };
        var num = parseInt(body.account_number);

        axios
          .get("https://banking34.herokuapp.com/api/user/" + num, configAxios)
          .then(function (response) {
            const resu = response.data.fullname;
            console.log("resu", resu);

            if (!resu) {
              return res.status(400).json({ msg: "Nhập sai stk" });
            }
            return res.status(201).json({ resu });
          })
          .catch(function (error) {
            console.log(error.response);
            return res.status(400).send(error.response);
          });
        break;
      default:
        return res.status(400);
        break;
    }
  },

  TransferOtherBank: async function (req, res) {
    console.log("body", req.body);
    const partner_bank = req.body.partner_bank;
    switch (partner_bank) {
      case "TUB":
        const privateKeyArmored = fs.readFileSync("my_rsa_private.key", "utf8");
        const myKeyPrivate = new NodeRSA().importKey(privateKeyArmored);
        const body2 = req.body;
        const bank_code = "PPNBank";
        const ts = Date.now();
        const hashString = hash.MD5(
          bank_code + ts.toString() + JSON.stringify(req.body) + config.auth.secretPartnerRSA
        );
        var sig = myKeyPrivate.sign(hashString, "hex", "hex");
        console.log("sig", sig);
        const headers = { ts, bank_code, sig };
        console.log("headers", headers);
        const { content, amount, transferer, receiver, payFee } = req.body;
        await accountModel.findOne("checking_account_number", transferer).then((rows) => {
          console.log(rows);
          row = rows[0];
          if (rows.length < 1) {
            res.status(400).json({ msg: "tài khoản không tồn tại" });
          } else {
            superagent
              .post(`${config.auth.apiRoot}/money-transfer`)
              .send(body2)
              .set(headers)
              .end((err, result) => {
                if (err) {
                  console.log("err", err);
                  return res.status(400).json({ msg: err.message });
                }
                accountModel.updateCheckingMoney(transferer, row.checking_account_amount - amount);
                //log
                //history log
                let transactionHistory = {
                  sender_account_number: body2.transferer,
                  sender_bank_code: bank_code,
                  receiver_account_number: body2.receiver,
                  //don't have bankcode of receiver
                  receiver_bank_code: partner_bank,
                  amount: body2.amount,
                  transaction_fee: 5000,
                  log: body2.transferer + " đã gửi " + body2.amount + " cho " + body2.receiver,
                  message: body2.content,
                  type: 0,
                };
                transactionModel.add(transactionHistory);

                //lưu thông tin người nhận
                if (req.body.checked == true) {
                  var result = "";

                  if (req.body.reminder == "") {
                    result = req.body.receiverName;
                  } else {
                    result = req.body.reminder;
                  }
                  const newReceiver = {
                    user_id: req.body.user_id,
                    name_reminiscent: result,
                    reminder_account_number: req.body.receiver,
                    bank_code: "TUB",
                  };
                  console.log("newReceiver", newReceiver);
                  receiverModel.add(newReceiver);
                }

                const resu = JSON.parse(result.text);
                res.status(200).json({ resu });
              });
          }
        });
        break;
      case "partner34":
        const time = moment().valueOf();
        const body = JSON.stringify(req.body);

        const hash3 = crypto
          .createHash("sha256")
          .update(time + body + config.auth.secret)
          .digest("hex");
        const code = config.auth.bankcode;
        const accN = parseInt(req.body.accNum);
        const data = `${req.body.moneyAmount},${accN},${time}`;
        const signature = await signData(data);
        // console.log(signature.split("\r\n").join("\\n"));
        const rows = await accountModel.findOne("checking_account_number", req.body.transferer);
        var row = "";
        if (rows.length < 1) {
          return res.status(400).json({ msg: "tài khoản không tồn tại" });
        } else {
          row = rows[0];
        }

        const configAxios = {
          headers: {
            "x-time": time,
            "x-partner-code": code,
            "x-hash": hash3,
            "x-signature-pgp": signature.split("\r\n").join("\\n"),
          },
        };
        const postBody = req.body;
        axios
          .post("https://banking34.herokuapp.com/api/transfer/update", postBody, configAxios)
          .then(function (response) {
            console.log(postBody);
            accountModel.updateCheckingMoney(
              req.body.transferer,
              row.checking_account_amount - req.body.moneyAmount
            );
            //log
            //history log
            let transactionHistory = {
              sender_account_number: postBody.transferer,
              sender_bank_code: "PPNBank",
              receiver_account_number: postBody.accNum,
              //don't have bankcode of receiver
              receiver_bank_code: "partner34",
              amount: postBody.moneyAmount,
              transaction_fee: 5000,
              log: postBody.transferer + " đã gửi " + postBody.moneyAmount + " cho " + postBody.accNum,
              message: postBody.content,
              type: 0,
            };
            transactionModel.add(transactionHistory);

            if (req.body.checked == true) {
              var result = "";

              if (req.body.reminder == "") {
                result = req.body.receiverName;
              } else {
                result = req.body.reminder;
              }
              const newReceiver = {
                user_id: req.body.user_id,
                name_reminiscent: result,
                reminder_account_number: req.body.accNum,
                bank_code: "partner34",
              };
              console.log("newReceiver", newReceiver);
              receiverModel.add(newReceiver);
            }

            return res.status(200).json(response.data);
          })
          .catch(function (error) {
            console.log("err2", error.response);
            return res.status(401).json(error.response);
          });
        break;
      default:
        break;
    }
  },
  myBankDetail: async function (req, res) {
    if (req.body.bank_code == "PPNBank") {
    } else {
      var con = confirm(req);
      if (con == 1) {
        //time #
        return res.status(400).send({
          message: "The request was out of date.", // quá hạn
        });
      }

      if (con == 2) {
        return res.status(400).send({
          message: "You are not one of our partners.",
        });
      }

      if (con == 3) {
        //sig #

        return res.status(400).send({
          message: "The file was changed by strangers." + JSON.stringify(req.headers.sig),
        });
      }
    }

    try {
      const rows_id = await accountModel.findOne("checking_account_number", req.body.account_number);
      if (rows_id.length <= 0) {
        return res.status(403).json({ msg: "Không tìm thấy tài khoản này" });
      }

      const idFind = rows_id[0].user_id;
      const rows = await userModel.findOne("id", idFind);
      console.log(rows_id);
      if (rows.length == 0) {
        return res.status(403).send({
          message: `No user has account number ${req.body.account_number}`,
        });
      } else {
        const ret = {
          account: req.body.account_number,
          name: rows[0].name,
        };

        return res.status(200).send(ret);
      }
    } catch (err) {
      console.log("error: ", err.message);
      return res.status(500).send({ message: "Error." });
    }
  },
  TransferSameBank: async function (req, res) {
    const data = {
      transferer: req.body.transferer,
      receiver: req.body.receiver,
      amount: req.body.amount,
      content: req.body.content,
      payFee: req.body.payFee,
      receiverName: req.body.reminder,
      checked: req.body.checked,
    };
    console.log("data", data);
    //kiểm tra tài khoản người gửi
    const account_transfer = await accountModel.findOne("checking_account_number", data.transferer);
    const transferer = account_transfer[0];
    const account_receiver = await accountModel.findOne("checking_account_number", data.receiver);
    const receiver = account_receiver[0];
    const transfer_fee = 3000;
    switch (data.payFee) {
      case "transferer":
        accountModel.updateCheckingMoney(
          transferer.checking_account_number,
          transferer.checking_account_amount - data.amount - transfer_fee
        );
        accountModel.updateCheckingMoney(
          receiver.checking_account_number,
          receiver.checking_account_amount + data.amount
        );
        break;
      case "receiver":
        accountModel.updateCheckingMoney(
          transferer.checking_account_number,
          transferer.checking_account_amount - data.amount
        );
        accountModel.updateCheckingMoney(
          receiver.checking_account_number,
          receiver.checking_account_amount + data.amount - transfer_fee
        );
        break;
      default:
        break;
    }
    let transactionHistory = {
      sender_account_number: transferer.checking_account_number,
      sender_bank_code: "PPNBank",
      receiver_account_number: receiver.checking_account_number,
      //don't have bankcode of receiver
      receiver_bank_code: "PPNBank",
      amount: data.amount,
      transaction_fee: 3000,
      log:
        " Chuyển tiền cùng ngân hàng " +
        transferer.checking_account_number +
        " đã gửi " +
        data.amount +
        " cho " +
        receiver.checking_account_number,
      message: data.content,
      type: 0,
    };
    transactionModel.add(transactionHistory);
    if (data.checked == true) {
      var result = "";

      if (data.receiverName == "") {
        const rows = await userModel.findOne("id", receiver.user_id);
        result = rows[0].name;
      } else {
        result = data.receiverName;
      }
      const newReceiver = {
        user_id: req.body.user_id,
        name_reminiscent: result,
        reminder_account_number: data.receiver,
        bank_code: "PPNBank",
      };
      console.log("newReceiver", newReceiver);
      receiverModel.add(newReceiver);
    }
    return res.status(201).json({ msg: "Chuyển tiền thành công" });
  },
  receive: async function (req, res) {
    const { ts, bank_code, sig } = req.headers;

    const private = fs.readFileSync("partner_RSA_private.key", "utf8");
    const privateKey = new NodeRSA().importKey(private);
    const body = req.body;
    const ts2 = moment().valueOf();
    const hashString3 = hash.MD5(bank_code + ts + JSON.stringify(req.body) + config.auth.secret);
    const mySign = privateKey.sign(hashString3, "hex", "hex");
    const public = fs.readFileSync("partner_RSA_public.key", "utf8");
    const publicKey = new NodeRSA().importKey(public);
    const hashString = hash.MD5(bank_code + ts + JSON.stringify(req.body) + config.auth.secret);
    var veri = publicKey.verify(hashString, mySign, "hex", "hex");
    const currentTime = moment().valueOf();

    console.log("ts", ts2);
    console.log("sig", hashString);

    if (currentTime - ts > config.auth.expireTime) {
      console.log("return 1");
      res.status(401).json({ msg: "wrong time" });
    }

    if (bank_code != config.auth.partnerRSA && bank_code != config.auth.partnerPGP) {
      console.log("return 2");
      res.status(401).json({ msg: "wrong bank code" });
    }
    const comparingSign = hash.MD5(ts + JSON.stringify(req.body) + config.auth.secret);
    // // const comparingSign = "8685a1e0c9a64edb138216e66188fb17";
    // if (sig != comparingSign) {
    //   console.log(comparingSign);
    //   console.log("return 3");

    //   return 3;
    // }

    if (!req.body.transferer) {
      console.log("return 4");
      res.status(401).json({ msg: "wrong transferer" });

      res.status(401);
    }

    if (veri != true) {
      return res.status(400).json({
        msg: "Wrong sign.",
      });
    }
    const { content, amount, transferer, receiver, payFee } = req.body;
    switch (bank_code) {
      case "TUB":
        console.log(req.body);
        console.log(receiver);
        accountModel.findOne("checking_account_number", receiver).then((rows, err) => {
          if (rows.length <= 0 || err) {
            res.status(401).json({ msg: "khong tim thay tai khoan nay" });
            return;
          }
          console.log(rows);
          accountModel.updateCheckingMoney(receiver, amount);
          //log
          let transactionHistory = {
            sender_account_number: body.transferer,
            sender_bank_code: bank_code,
            receiver_account_number: body.receiver,
            receiver_bank_code: "PPNBank",
            //don't have bankcode of receiver
            amount: body.amount,
            transaction_fee: 5000,
            log: body.transferer + " đã gửi " + body.amount + " cho " + body.receiver,
            message: body.content,
            type: 0,
          };
          transactionModel.add(transactionHistory);
          res.status(200).json({ msg: "Chuyển tiền thành công " });
        });
        break;
      case "partner34":
        console.log(req.body);
        console.log(receiver);
        accountModel.findOne("checking_account_number", receiver).then((rows, err) => {
          if (rows.length <= 0 || err) {
            res.status(401).json({ msg: "khong tim thay tai khoan nay" });
            return;
          }
          console.log(rows);
          accountModel.updateCheckingMoney(receiver, amount);
          //log
          let transactionHistory = {
            sender_account_number: body.transferer,
            sender_bank_code: bank_code,
            receiver_account_number: body.receiver,
            receiver_bank_code: "PPNBank",
            //don't have bankcode of receiver
            amount: body.amount,
            transaction_fee: 5000,
            log: body.transferer + " đã gửi " + body.amount + " cho " + body.receiver,
            message: body.content,
            type: 0,
          };
          transactionModel.add(transactionHistory);
          res.status(200).json({ msg: "Chuyển tiền thành công " });
        });
        break;
      default:
        return res.status(403).json({ msg: " Ngân hàng lạ chưa connect" });
        break;
    }
  },

  getAll: async function (req, res, next) {
    const data = transactionModel.findAll().then((rows) => {
      console.log(rows);
      res.status(200).json({ rows });
    });
  },
};
async function signData(data) {
  const privateKeyArmored = config.auth.myPrivatePGP;
  const passphrase = config.auth.passphrase; // what the private key is encrypted with
  const {
    keys: [privateKey],
  } = await openpgp.key.readArmored(privateKeyArmored);
  // console.log("private", privateKeyArmored);

  const a = await privateKey.decrypt(passphrase);

  const { data: text } = await openpgp.sign({
    message: openpgp.cleartext.fromText(data), // CleartextMessage or Message object
    privateKeys: [privateKey], // for signing
  });

  return text;
}
