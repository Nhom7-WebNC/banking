const accountModel = require("../models/accountModel");
const otpModel = require("../models/otpModel");
const transactionModel = require("../models/transactionModel");
const receiverModel = require("../models/receiverModel");
var mailSender = require("../config/mail");
const config = require("../config/default.json");
const process = require("../config/process.config");
const NodeRSA = require("node-rsa");
var superagent = require("superagent");
const hash = require("object-hash");
const moment = require("moment");
const fs = require("fs");
var row = {};

const userModel = require("../models/userModel");
const { updateCheckingMoney } = require("../models/accountModel");
const { resolveSoa } = require("dns");
const { SSL_OP_SINGLE_ECDH_USE } = require("constants");
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
      res.status(400).json({ msg: "username " + req.body.username + " chua co tai khoan nao" });
      return;
    }
    account = accounts[0];
    console.log(accounts);
    res.status(200).json(account);
    return;
  },

  //Chuyển tiền cùng ngân hàng
  TransferSameBank: async function (req, res) {
    const data = {
      transferer: req.body.transferer,
      receiver: req.body.receiver,
      amount: req.body.amount,
      content: req.body.content,
      payFee: req.body.payFee,
      receiverName: req.body.reminder,
    };
    //kiểm tra tài khoản người gửi
    const account_transfer = await accountModel.findOne("checking_account_number", data.transferer);
    if (account_transfer.length <= 0) {
      res.status(403).json({ msg: "tai khoan nguoi gui khong ton tai" });
    }
    const transferer = account_transfer[0];

    const account_receiver = await accountModel.findOne("checking_account_number", data.receiver);
    if (account_receiver.length <= 0 || data.transferer == data.receiver) {
      res.status(403).json({ msg: "tai khoan nguoi nhan khong ton tai" });
    }
    const receiver = account_receiver[0];
    const transfer_fee = 3000;
    if (transferer.checking_account_amount > data.amount && data.amount > transfer_fee) {
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
      };
      transactionModel.add(transactionHistory);
      if (req.body.checked == true) {
        const newReceiver = {
          user_id: req.body.user_id,
          name_reminiscent: req.body.reminder,
          reminder_account_number: data.receiver,
          bank_code: "PPNBank",
        };
        receiverModel.add(newReceiver);
      }
      res.status(201).json({ msg: "Chuyển tiền thành công" });
    } else {
      res.status(403).json({ msg: "Số tiền trong tài khoản không đủ" });
    }
  },

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

  TransferOtherBank: async function (req, res) {
    const privateKeyArmored = fs.readFileSync("my_rsa_private.key", "utf8");

    const myKeyPrivate = new NodeRSA().importKey(privateKeyArmored);

    let body = req.body;

    const bank_code = "PPNBank";
    const ts = Date.now();

    const hashString = hash.MD5(
      bank_code + ts.toString() + JSON.stringify(req.body) + config.auth.secretPartnerRSA
    );
    // const hashString = hash.MD5(config.auth.secretPartnerRSA);
    var sig = myKeyPrivate.sign(hashString, "hex", "hex");
    const headers = { ts, bank_code, sig };
    const { content, amount, transferer, receiver, payFee } = req.body;
    await accountModel.findOne("checking_account_number", transferer).then((rows) => {
      row = rows[0];
      console.log(row.checking_account_amount);
    });
    if (row.checking_account_amount > amount) {
      superagent
        .post(`${config.auth.apiRoot}/money-transfer`)
        .send(body)
        .set(headers)
        .end((err, result) => {
          accountModel.updateCheckingMoney(transferer, 0 - amount);
          //log
          //history log
          let transactionHistory = {
            sender_account_number: body.transferer,
            sender_bank_code: bank_code,
            receiver_account_number: body.receiver,
            //don't have bankcode of receiver
            receiver_bank_code: "",
            amount: body.amount,
            transaction_fee: 5000,
            log: body.transferer + " đã gửi " + body.amount + " cho " + body.receiver,
            message: body.content,
          };
          transactionModel.add(transactionHistory);
          res.status(200).json(result.text);
        });
    } else {
      res.status(400).json({
        message: "Tài khoản không đủ tiền",
        receiver,
      });
    }
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
      return 1;
    }

    if (bank_code != config.auth.partnerRSA && bank_code != config.auth.partnerPGP) {
      console.log("return 2");
      return 2;
    }

    if (!req.body.transferer) {
      console.log("return 4");
      return 4;
    }

    if (veri != true) {
      return res.status(400).send({
        message: "Wrong sign.",
      });
    }

    switch (bank_code) {
      case "TUB":
        const { content, amount, transferer, receiver, payFee } = req.body;

        if (accountModel.findOne("checking_account_number", receiver)) {
          accountModel.updateCheckingMoney(receiver, amount);
          //log
          let transactionHistory = {
            sender_account_number: body.transferer,
            sender_bank_code: bank_code,
            receiver_account_number: body.receiver,
            //don't have bankcode of receiver
            receiver_bank_code: "",
            amount: body.amount,
            transaction_fee: 5000,
            log: body.transferer + " đã gửi " + body.amount + " cho " + body.receiver,
            message: body.content,
          };
          transactionModel.add(transactionHistory);
        } else {
          res.status(400).json({
            message: "Veri successont have this account",
            receiver,
          });
        }

      case "ABC":
    }

    return res.status(200).json({
      message: "Chuyển tiền thành công",
    });
  },
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
        //update Partner_Call_Log
        const entityUpdateLog1 = {
          bank_code: req.get("bank_code"),
          account_number: req.body.account_number,
          created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };

        // const updatePartnerLog1 = await partnerCallLog.add(entityUpdateLog1);

        return res.status(200).send(ret);
      }
    } catch (err) {
      console.log("error: ", err.message);
      return res.status(500).send({ message: "Error." });
    }
  },
  partnerBankDetail: async function (req, res) {
    const body = req.body;
    console.log("body", body);
    const bank_code = config.auth.bankcode;

    const ts = Date.now();
    const sig = hash.MD5(bank_code + ts + JSON.stringify(body) + config.auth.secretPartnerRSA);
    console.log("sig", sig);
    console.log("ts", ts);
    const headers = { bank_code, sig, ts };
    console.log("headers", headers);
    console.log("url", `${config.auth.apiRoot}/bank-detail`);

    superagent
      .get(`${config.auth.apiRoot}/bank-detail`)
      .send(body)
      .set(headers)
      .end((err, result) => {
        console.log(result.res.text);
        res.status(200).json({ account_number: req.body.account_number, name: JSON.parse(result.res.text).name });
      });
  },
};
