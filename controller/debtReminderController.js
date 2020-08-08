const debtModel = require("../models/debtReminderModel");
const accountModel = require("../models/accountModel");
const userModel = require("../models/userModel");
var nodemailer = require("nodemailer");
var mailSender = require("../config/mail");
module.exports = {
  payDebt: async function (req, res, next) {
    const { id } = req.body;
    const debts = await debtModel.findOne("id", id);
    const debt = debts[0];
    const creditors = await accountModel.findOne("checking_account_number", debt.creditor_account_number);
    const creditor = creditors[0];
    const debtors = await accountModel.findOne("checking_account_number", debt.debtor_account_number);
    const debtor = debtors[0];
    console.log("debt", debt);
    if (debtor.checking_account_amount < debt.amount) {
      res.status(400).json({ msg: "Tài khoản của bạn không đủ để thanh toán nợ này" });
    } else {
      accountModel.updateCheckingMoney(debt.debtor_account_number, debtor.checking_account_amount - debt.amount);
      const total = creditor.checking_account_amount + debt.amount;
      accountModel.updateCheckingMoney(debt.creditor_account_number, total);
      debt.status = 1;
      await debtModel.updateByOne("id", id, debt);
      const partnerUser = await userModel.findOne("id", creditor.user_id);
      let email = partnerUser[0].email;
      console.log("email", email);
      let transporter = nodemailer.createTransport(mailSender);
      var text_mail =
        "Account number " +
        debt.debtor_account_number +
        " have just pay debt reminder created by you with amount : " +
        debt.amount +
        " your current amount : " +
        total;
      let mailOptions = {
        to: email,
        subject: "PPNBank pay debt ",
        text: text_mail,
      };
      //
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(400);
        }
        console.log("Message %s sent: %s", info.messageId, info.response);
      });

      res.status(200).json({ msg: "Thanh toán nợ thành công" });
    }
  },
  createDebt: async function (req, res, next) {
    if (req.body.receiver == req.body.sender || req.body.amount < 0) {
      return res.status(400).json({ msg: "Nhập sai thông tin , vui lòng nhập lại" });
    } else {
      const accounts = await accountModel.findOne("checking_account_number", req.body.receiver);
      if (accounts.length < 1) {
        return res.status(400).json({ msg: "Tài khoản không tồn tại" });
      }
    }
    const newDebt = {
      creditor_account_number: req.body.sender,
      debtor_account_number: req.body.receiver,
      amount: req.body.amount,
      message: req.body.message,
      status: 0,
    };

    debtModel.add(newDebt);
    return res.status(200).json("Tạo nhắc nợ thành công");
  },
  getListDebt: async function (req, res, next) {
    var activeTab0 = [];
    var activeTab1 = [];
    // console.log("hh");

    const accountNumber = req.body.account_number;
    // console.log(accountNumber);

    await debtModel.findByAccountNumber(accountNumber).then((rows) => {
      // console.log("rows", rows);
      rows.map((row) => {
        if (row.status < 1) {
          if (row.creditor_account_number == accountNumber) {
            //console.log(row);
            activeTab0.push(row);
          }
          if (row.debtor_account_number == accountNumber) {
            //console.log(row);
            activeTab1.push(row);
          }
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
