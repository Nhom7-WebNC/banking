var express = require("express");
const moment = require("moment");
const md5 = require("md5");
const hash = require("object-hash");
const NodeRSA = require("node-rsa");
const openpgp = require("openpgp");
const fs = require("fs");
const config = require("../config/default.json");
const process = require("../config/process.config");
const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
const axios = require("axios");
var router = express.Router();
var superagent = require("superagent");

// const recPartnerLog = require('../models/rec_partner_log.model');
// const transactionModel = require("../models/transaction.model");
// function truyvan(req) {
//   const {bank_code,ts,sig} = req.headers;

//   const currentTime = moment().valueOf();
//   if (currentTime - ts > config.auth.expireTime) {
//     return 1;
//   }

//   const comparingSign = md5(bank_code +  ts + JSON.stringify(req.body) + config.auth.secret);

//   if (sig != comparingSign) {
//     return 2;
//   }

//   console.log("currentTime",currentTime);
//   console.log("sig",sig);
// }

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
router.get("/", async function (req, res) {
  accountModel.updateCheckingMoney(3000001, 1234);
  res.json("Welcome to userRoute Sucess");
});
router.post("/transfer", async function (req, res) {
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
});

router.post("/partner/transfer", async (req, res) => {
  //tạo key
  const { ts, bank_code, sig } = req.headers;
  // const publicString = fs.readFileSync("partner_RSA_private.key", "utf8");
  // const publicKey = new NodeRSA().importKey(publicString);

  const body = req.body;
  // const ts2 = moment().valueOf();
  // const hashString3 = hash.MD5(bank_code + ts + JSON.stringify(req.body) + config.auth.secret);
  // const mySign = publicKey.sign(hashString3, "hex", "hex");

  // console.log(ts2);
  // console.log("hash", hashString3);

  //giãi key

  const privateString = fs.readFileSync("partner_RSA_public.key", "utf8");
  const privateKey = new NodeRSA().importKey(privateString);
  const hashString = hash.MD5(bank_code + ts + JSON.stringify(req.body) + config.auth.secret);

  var veri = privateKey.verify(hashString, sig, "hex", "hex");

  const currentTime = moment().valueOf();

  console.log("time", currentTime, "   sig", hashString);
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

  // try{

  // }catch(){

  // }
  // try {
  //   const rows_id = await accountModel(req.body.account_number);
  //   const idFind = rows_id[0].user_id;
  //   const rows = await userModel.singleById(idFind);
  //   // console.log("12345");
  //   if (rows.length == 0) {
  //     return res
  //       .status(403)
  //       .send({ message: `No user has account number ${req.body.account_number}` });
  //   } else {
  //     const ret = {
  //       fullname: rows[0].fullname,
  //     };
  //     //update Recharge_Partner_Code
  //     const entityUpdateLog1 = {
  //       bank_code: req.get("partnerCode"),
  //       account_number: req.body.account_number,
  //       created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
  //     };

  //     return res.status(200).send(ret);
  //   }
  // } catch (err) {
  //   console.log("error: ", err.message);
  //   return res.status(500).send({ message: "Error." });
  // }
});

router.get("/partner", async (req, res) => {
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
});

//Thêm mới 1 account - từ một user_id bên bảng users
// Cái này chỉ dành cho trong nội bộ
// Chỉ có nhân viên ngân hàng mới có thể thêm mới 1 account
// Trong request.body gửi lên là user_id và balance
router.post("/add", async function (req, res) {
  try {
    const rows = await userModel.findById(req.body.user_id);

    if (rows.length == 0) {
      return res.status(403).send({ message: `No user has id ${req.body.user_id}` });
    } else {
      const newAccount = {
        account_number: "23050000" + req.body.user_id,
        user_id: req.body.user_id,
        balance: req.body.balance,
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
});

router.get("/logConfirm", () => {
  confirm();
});

router.get("/bank-detail", async (req, res) => {
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
      res.status(200).json({ account_number: req.body.account_number, name: JSON.parse(result.res.text).name });
    });
});
// truy vấn thông tin tài khoản

// nộp tiền vào tài khoản

router.post("/partner/recharge", async function (req, res) {
  const bank_code = req.get("bank_code");
  const signature = req.get("signature"); // sig hay sign ?

  // Kiểm tra ngân hàng liên kết là RSA/ PGP hay ForTest để lấy keyPulic
  let partner;
  if (bank_code == config.auth.partnerRSA) {
    partner = process.partnerRSA;
  }
  if (bank_code == config.auth.partnerPGP) {
    partner = process.partnerPGP;
  }
  if (bank_code == config.auth.partnerForTestRSA) {
    partner = process.partnerForTestRSA;
  }
  const keyPublic = new NodeRSA(partner.RSA_PUBLICKEY);
  const veri = keyPublic.verify(JSON.stringify(req.body), signature, "base64", "base64");
  // const data = req.body.account_num + ', ' + req.body.money + ', ' + req.body.currentTime;

  // (xem lai source encoding: (base64/utf8))
  // source encoding cua ham veri() phu thuoc vao ham sign()
  var con = confirm(req);

  if (con == 1) {
    return res.status(400).send({
      message: "The request was out of date.",
    });
  }

  if (con == 2) {
    return res.status(400).send({
      message: "You are not our partner.",
    });
  }

  if (con == 3) {
    return res.status(400).send({
      message: "The file was changed by strangers.",
    });
  }

  if (con == 4) {
    return res.status(400).send({
      message: "Missing user account number.",
    });
  }

  if (veri != true) {
    return res.status(400).send({
      message: "Wrong sign.",
    });
  }

  try {
    const account = await accountModel.findByAccountNumber(req.body.account_number);
    if (account.length <= 0) {
      res.send("Number not found");
      throw createError(401, "Number not found");
    }

    const moneySend = +req.body.money || 0;
    // const accBal = await accountModel.findById(account[0].user_id); //lay so du tai khoan
    const newMoney = +account[0].balance + moneySend; //cong voi tien can nap vo

    const entity = {
      balance: newMoney,
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    const ret = await accountModel.updateMoney(account[0].user_id, entity); //update lai so du tai khoan

    // response về cho ngân hàng B :
    const responseForClient = {
      account_number: req.body.account_number,
      newMoney: newMoney,
      currentTime: moment().valueOf(),
    };
    const pCode = req.get("bank_code");
    if (pCode == config.auth.partnerRSA || pCode == config.auth.partnerForTestRSA) {
      // partner RSA
      const keyPrivate = new NodeRSA(process.ourkey.RSA_PRIVATEKEY);
      const keysigned = keyPrivate.sign(responseForClient, "base64", "base64");

      res.status(203).json({
        status: "RSA success",
        responseSignature: keysigned,
      });
    } else {
      // partner PGP
      const privateKeyArmored = process.ourkey.PGP_PRIVATEKEY;
      const {
        keys: [privateKey],
      } = await openpgp.key.readArmored(privateKeyArmored);
      await privateKey.decrypt(process.ourkey.passpharse);
      // Sign => save into cleartext
      const { data: cleartext } = await openpgp.sign({
        message: openpgp.cleartext.fromText(JSON.stringify(responseForClient)),
        privateKeys: [privateKey],
      });

      res.status(203).json({
        status: "PGP success",
        responseSignature: cleartext,
      });
    }

    //update Recharge_Partner_Code
    const entityUpdateLog = {
      bank_code: req.get("bank_code"),
      receive_account_number: req.body.account_number,
      money: moneySend,
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    const updatePartnerLog = await recPartnerLog.add(entityUpdateLog);

    // const currentTime = moment().valueOf();
    // const data = req.body.account_num + ", " + req.body.money + ", " + req.body.currentTime;
    // // console.log(data);
    // const mySig = await signData(data);
    // res.status(203).json({
    //   status: "success",
    //   responseSignature: mySig,
    // });
  } catch (err) {
    console.log("error: ", err.message);
    return res.status(500).send({ message: "Error." });
  }
});

// async function signPGP(data) {
//   //const privateKeyArmored =  config.privatePGPArmored; // encrypted private key
//   const privateKeyArmored = await fs.readFile("../config/0x09153698-sec.asc");
//   const passphrase = config.passphrase; // what the private key is encrypted with

//   const {
//     keys: [privateKey],
//   } = await openpgp.key.readArmored(privateKeyArmored);
//   await privateKey.decrypt(passphrase);

//   const { data: text } = await openpgp.sign({
//     message: openpgp.cleartext.fromText(data), // CleartextMessage or Message object
//     privateKeys: [privateKey], // for signing
//   });
//   return text;
// }
module.exports = router;
