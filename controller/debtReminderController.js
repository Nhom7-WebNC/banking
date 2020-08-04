const debtModel = require("../models/debtReminderModel");
const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
var nodemailer = require("nodemailer");
var mailSender = require("../config/mail");
module.exports = {
  payDebt: async function (req, res, next) {
    setTimeout(function () {
      console.log("run !");
    }, 2000);
  },
  createDebt: async function (req, res, next) {
    const newDebt = {
      creditor_account_number: req.body.sender,
      debtor_account_number: req.body.receiver,
      amount: req.body.amount,
      message: req.body.message,
      status: 0,
    };

    debtModel.add(newDebt);
    return res.status(200).json("Tao nhac no thanh cong");
  },
  getListDebt: async function (req, res, next) {
    var activeTab0 = [];
    var activeTab1 = [];
    console.log("hh");

    const accountNumber = req.body.account_number;
    console.log(accountNumber);

    await debtModel.findByAccountNumber(accountNumber).then((rows) => {
      console.log("rows", rows);
      rows.map((row) => {
        if (row.creditor_account_number == accountNumber) {
          //console.log(row);
          activeTab0.push(row);
        }
        if (row.debtor_account_number == accountNumber) {
          //console.log(row);
          activeTab1.push(row);
        }
      });
    });

    activeTab1.length || activeTab0.length
      ? res.status(200).json({ data: { activeTab0: activeTab0, activeTab1: activeTab1 } })
      : res.status(401).json({ msg: "Tài khoản chưa có nhắc nợ" });

    // res.status(200).json({data: activeTab1})
  },
  cancelDebt: async function (req, res, next) {
    //type =0 mình tạo, type = 1 người khác tạo
    const { id, message, type } = req.body;

    const currentDebt = await debtModel.findOne("id", id);
    console.log(currentDebt);
    console.log(currentDebt[0]);

    let partnerAccount = await accountModel.findOne(
      "checking_account_number",
      currentDebt[0].debtor_account_number
    );
    if (type == 1) {
      partnerAccount = await accountModel.findOne(
        "checking_account_number",
        currentDebt[0].creditor_account_number
      );
    }
    const partnerUser = await userModel.findOne("id", partnerAccount[0].user_id);
    let email = partnerUser[0].email;
    console.log("email", email);
    let transporter = nodemailer.createTransport(mailSender);
    const amount = currentDebt[0].amount;
    var text_mail =
      "Account number " +
      partnerAccount[0].checking_account_number +
      " have just canceled debt reminder created by you (amount : " +
      amount +
      ") with message :" +
      message;
    if (type == 0) {
    } else {
      text_mail =
        "Account number " +
        partnerAccount[0].checking_account_number +
        " have just canceled debt reminder created by their (amount : " +
        amount +
        ") with message :" +
        message;
    }

    let mailOptions = {
      to: email,
      subject: "PPNBank debt reminder",
      text: text_mail,
    };
    //
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(400);
      }
      console.log("Message %s sent: %s", info.messageId, info.response);
    });
    const entity = {
      id: id,
    };
    await debtModel.delete(entity);
    res.status(200).json({ msg: "Hủy nhắc nợ thành công" });
  },
};
