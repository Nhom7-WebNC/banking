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

  //------------------------------lịch sử giao dịch---------------------------------------
  getTransaction: async function (req, res, next) {
    var activeTab0 = [];
    var sum = 0;
    console.log(req.body);
    const bank_code = req.body.bank_code;
    const dateStart = req.body.dateStart;
    const dateEnd = req.body.dateEnd;
    // console.log(bank_code.dateStart.dateEnd);
    console.log(bank_code);
    console.log(dateStart);
    console.log(dateEnd);
    var a = new Date(dateStart);
    var b = new Date(dateEnd);

    if (a > b) {
      res
        .status(401)
        .json({ msg: "Ngày bắt đầu không được lớn hơn ngày kết thúc" });
    } else if (bank_code == "" || dateStart == "" || dateEnd == "") {
      res.status(401).json({ msg: "Nhập thiếu thông tin" });
    } else {
      if (bank_code == "all") {
        await transactionModel.findByTime(dateStart, dateEnd).then((rows) => {
          rows.map((row) => {
            if (
              row.sender_bank_code != "PPNBank" &&
              row.receiver_bank_code != "PPNBank"
            ) {
              activeTab0.push(row);
              sum = sum + row.amount;
            }
          });
        });
      } else {
        await transactionModel.findByTime(dateStart, dateEnd).then((rows) => {
          rows.map((row) => {
            if (
              row.sender_bank_code == bank_code ||
              row.receiver_bank_code == bank_code
            ) {
              activeTab0.push(row);
              sum = sum + row.amount;
            }
          });
        });
      }
      activeTab0.length
        ? res.status(200).json({ data: { activeTab0: activeTab0, sum: sum } })
        : res.status(401).json({ msg: "Không có giao dịch" });
    }
  },
};
