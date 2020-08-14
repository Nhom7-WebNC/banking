const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const transactionModel = require("../models/transactionModel");
module.exports = {
  manager: async function (req, res, next) {
    await userModel.findOne("role_name", "employee").then((rows) => {
      console.log(rows);
      res.status(200).json({ data: rows });
    });
  },
  createAccount: async function (req, res, next) {
    const password = req.body.password;
    console.log(password);
    const user = userModel
      .findOne("username", req.body.username)
      .then((rows) => {
        if (rows.length > 0) {
          res.status(403).json({ msg: "tai khoan da ton tai" });
        } else {
          if (!req.body.username) {
            res.status(403).json({ msg: "khong co username" });
          }

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
              console.log(newUserMysql);

              userModel.add(newUserMysql);

              return res
                .status(200)
                .json("dang ki thanh cong" + { newUserMysql });
            });
          });
        }
      });
  },
  delete: async function (req, res, next) {
    const entity = {
      id: req.params.id,
    };
    //userModel.delete(entity)
    await userModel.delete(entity);
    await userModel.findOne("role_name", "employee").then((rows) => {
      res.status(200).json({ data: rows });
    });
  },
  update: async function (req, res, next) {
    const id = req.body.id;
    console.log("hihihihihi", id);
    const newUserMysql = {
      username: req.body.username,
      name: req.body.name,
      phone_number: req.body.phone_number,
      email: req.body.email,
      birthday: req.body.birthday,
      address: req.body.address,
      gender: req.body.gender,
      personal_number: req.body.personal_number,
    };
    await userModel.updateByOne("id", id, newUserMysql);

    await userModel.findOne("role_name", "employee").then((rows) => {
      console.log(rows);
      res.status(200).json({ data: rows });
    });
  },

  getTransaction_byTime: async function (req, res, next) {
    var activeTab0 = [];

    const dateStart = req.body.dateStart;
    const dateEnd = req.body.dateEnd;

    await transactionModel.findByTime(dateStart,dateEnd).then((rows) => {
      rows.map((row) => {
        activeTab0.push(row);
      });
    });

    
    activeTab0.length
      ? res.status(200).json({
          data: {
            activeTab0: activeTab0,
          },
        })
      : res.status(401).json({ msg: "Chưa có giao dịch" });

  },

  getTransaction_all: async function (req, res, next) {
    var activeTab1 = [];

    await transactionModel.findAll().then((rows) => {
      rows.map((row) => {
        activeTab1.push(row);
      });
    });

    
    activeTab1.length
      ? res.status(200).json({
          data: {
            activeTab1: activeTab1,
          },
        })
      : res.status(401).json({ msg: "Chưa có giao dịch" });

  },

  getTransaction_byBankcode: async function (req, res, next) {
    var activeTab2 = [];
    const bank_code = req.body.bank_code;

    await transactionModel.findByBankcode(bank_code).then((rows) => {
      rows.map((row) => {
        activeTab2.push(row);
      });
    });

    activeTab2.length
      ? res.status(200).json({
          data: {            
            activeTab2: activeTab2,
          },
        })
      : res.status(401).json({ msg: "Chưa có giao dịch" });
  },
};
