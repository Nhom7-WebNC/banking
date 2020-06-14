var express = require("express");
var router = express.Router();
const accountModel = require("../models/accountModel");
const otpModel = require("../models/otpModel");
const transactionModel = require("../models/transactionModel");
var mailSender = require("../config/mail");
const config = require("../config/default.json");
const process = require("../config/process.config");
const NodeRSA = require("node-rsa");
var superagent = require("superagent");
const hash = require("object-hash");

const confirm = (req) => {
  console.log("header", req.headers);
  const ts = req.headers.ts; // const ts = +req.headers['ts'];

  // const bank_code = req.headers.bank_code;
  const bank_code = req.get("bank_code");
  const sig = req.headers.sig;
  const secret = req.headers.secret;
  const currentTime = moment().valueOf();

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

  if (!req.body.transferer) {
    console.log("return 4");
    return 4;
  }
  // hashSecretKey = md5(config.auth.secret);
  //  sig = md5(bank_code + ts + JSON.stringify(testbody) + hashSecretKey);
};
module.exports = {
  transfer: async function (req, res) {
    const privateKeyArmored = fs.readFileSync("my_rsa_private.key", "utf8");

    const myKeyPrivate = new NodeRSA().importKey(privateKeyArmored);

    const body = req.body;

    const { ts, bank_code, sig } = req.headers;

    const headers = { ts, bank_code, sig };
    const hashString = hash.MD5(bank_code + ts + JSON.stringify(req.body) + config.auth.secretPartnerRSA);
    // const hashString = hash.MD5(config.auth.secretPartnerRSA);
    var mySign = myKeyPrivate.sign(hashString, "hex", "hex");

    console.log("ts", moment().valueOf());
    console.log("hashString", mySign);

    superagent
      .post(`${config.auth.apiRoot}/money-transfer`)
      .send(body)
      .set(headers)
      .end((err, result) => {
        res.status(200).json(result.text);
      });
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

        if (accountModel.findByCheckingAccountNumber(receiver)) {
          accountModel.updateCheckingMoney(receiver, amount);
        } else {
          res.status(200).json({
            message: "Veri successont have this account",
            receiver,
          });
        }

      case "ABC":
    }

    return res.status(200).json({
      message: "Veri success",
    });
  },
  add: async function (req, res) {
    try {
      const rows = await userModel.findById(req.body.user_id);

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
  partnerBankDetail: async function (req, res) {
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

    if (con == 4) {
      return res.status(400).send({
        message: "Missing account_number.",
      });
    }

    try {
      const rows_id = await accountModel.findByAccountNumber(req.body.account_number);
      const idFind = rows_id[0].user_id;
      const rows = await userModel.findById(idFind);
      // console.log("12345");
      if (rows.length == 0) {
        return res.status(403).send({
          message: `No user has account number ${req.body.account_number}`,
        });
      } else {
        const ret = {
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
  myBankDetail: async function (req, res) {
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
    const name = accountModel.findById(body.account_number).name;

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
