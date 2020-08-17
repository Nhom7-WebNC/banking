const receiverModel = require("../models/receiverModel");
module.exports = {
  add: async function (req, res, next) {
    const newReceiver = {
      user_id: req.body.user_id,
      name_reminiscent: req.body.name_reminiscent,
      reminder_account_number: req.body.reminder_account_number,
      bank_code: req.body.bank_code,
    };
    receiverModel.add(newReceiver);

    res.status(200).json({ msg: "add receiver success" });
  },
  getById: async function (req, res, next) {
    receiverModel.findByUserIdAndBankCode(req.body.user_id, req.body.bank_code).then(async (rows, err) => {
      if (err) {
        res.status(400).json({ msg: "get Receiver list have no data" });
      }
      res.status(200).json({ rows });
    });
  },
  getAll: async function (req, res, next) {
    receiverModel.findOne("id", req.body.user_id).then(async (rows, err) => {
      if (err) {
        res.status(400).json({ msg: "get All Receiver list have no data" });
      }
      res.status(200).json({ rows });
    });
  },
  delete: async function (req, res, next) {
    const { id } = req.body;
    const entity = {
      id: id,
    };
    await receiverModel.delete(entity);
    res.status(201).json({ msg: "Xóa người nhận thành công" });
  },
  update: async function (req, res, next) {
    console.log("body", req.body);
    const { id, name_reminiscent } = req.body;
    const rows = await receiverModel.findOne("id", id);
    const newReceiver = rows[0];
    console.log("body", newReceiver);

    newReceiver.name_reminiscent = name_reminiscent;
    await receiverModel.updateByOne("id", id, newReceiver);
    res.status(201).json({ msg: "Đổi tên thành công" });
  },
};
