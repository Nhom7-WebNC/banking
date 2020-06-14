// truy vấn thông tin tài khoản

// nộp tiền vào tài khoản

// router.post("/partner/recharge", async function (req, res) {
//   const bank_code = req.get("bank_code");
//   const signature = req.get("signature"); // sig hay sign ?

//   // Kiểm tra ngân hàng liên kết là RSA/ PGP hay ForTest để lấy keyPulic
//   let partner;
//   if (bank_code == config.auth.partnerRSA) {
//     partner = process.partnerRSA;
//   }
//   if (bank_code == config.auth.partnerPGP) {
//     partner = process.partnerPGP;
//   }
//   if (bank_code == config.auth.partnerForTestRSA) {
//     partner = process.partnerForTestRSA;
//   }
//   const keyPublic = new NodeRSA(partner.RSA_PUBLICKEY);
//   const veri = keyPublic.verify(JSON.stringify(req.body), signature, "base64", "base64");
//   // const data = req.body.account_num + ', ' + req.body.money + ', ' + req.body.currentTime;

//   // (xem lai source encoding: (base64/utf8))
//   // source encoding cua ham veri() phu thuoc vao ham sign()
//   var con = confirm(req);

//   if (con == 1) {
//     return res.status(400).send({
//       message: "The request was out of date.",
//     });
//   }

//   if (con == 2) {
//     return res.status(400).send({
//       message: "You are not our partner.",
//     });
//   }

//   if (con == 3) {
//     return res.status(400).send({
//       message: "The file was changed by strangers.",
//     });
//   }

//   if (con == 4) {
//     return res.status(400).send({
//       message: "Missing user account number.",
//     });
//   }

//   if (veri != true) {
//     return res.status(400).send({
//       message: "Wrong sign.",
//     });
//   }

//   try {
//     const account = await accountModel.findByAccountNumber(req.body.account_number);
//     if (account.length <= 0) {
//       res.send("Number not found");
//       throw createError(401, "Number not found");
//     }

//     const moneySend = +req.body.money || 0;
//     // const accBal = await accountModel.findById(account[0].user_id); //lay so du tai khoan
//     const newMoney = +account[0].balance + moneySend; //cong voi tien can nap vo

//     const entity = {
//       balance: newMoney,
//       updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
//     };
//     const ret = await accountModel.updateMoney(account[0].user_id, entity); //update lai so du tai khoan

//     // response về cho ngân hàng B :
//     const responseForClient = {
//       account_number: req.body.account_number,
//       newMoney: newMoney,
//       currentTime: moment().valueOf(),
//     };
//     const pCode = req.get("bank_code");
//     if (pCode == config.auth.partnerRSA || pCode == config.auth.partnerForTestRSA) {
//       // partner RSA
//       const keyPrivate = new NodeRSA(process.ourkey.RSA_PRIVATEKEY);
//       const keysigned = keyPrivate.sign(responseForClient, "base64", "base64");

//       res.status(203).json({
//         status: "RSA success",
//         responseSignature: keysigned,
//       });
//     } else {
//       // partner PGP
//       const privateKeyArmored = process.ourkey.PGP_PRIVATEKEY;
//       const {
//         keys: [privateKey],
//       } = await openpgp.key.readArmored(privateKeyArmored);
//       await privateKey.decrypt(process.ourkey.passpharse);
//       // Sign => save into cleartext
//       const { data: cleartext } = await openpgp.sign({
//         message: openpgp.cleartext.fromText(JSON.stringify(responseForClient)),
//         privateKeys: [privateKey],
//       });

//       res.status(203).json({
//         status: "PGP success",
//         responseSignature: cleartext,
//       });
//     }

//     //update Recharge_Partner_Code
//     const entityUpdateLog = {
//       bank_code: req.get("bank_code"),
//       receive_account_number: req.body.account_number,
//       money: moneySend,
//       created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
//     };

//     const updatePartnerLog = await recPartnerLog.add(entityUpdateLog);

//     // const currentTime = moment().valueOf();
//     // const data = req.body.account_num + ", " + req.body.money + ", " + req.body.currentTime;
//     // // console.log(data);
//     // const mySig = await signData(data);
//     // res.status(203).json({
//     //   status: "success",
//     //   responseSignature: mySig,
//     // });
//   } catch (err) {
//     console.log("error: ", err.message);
//     return res.status(500).send({ message: "Error." });
//   }
// });
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
