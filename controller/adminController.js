const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
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
    const user = userModel.findOne("username", req.body.username).then((rows) => {
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

            return res.status(200).json("dang ki thanh cong" + { newUserMysql });
          });
        });
      }
    });
  },
  delete: function (req, res, next) {
    console.log("afdsfasdfsafsdfasfd");
    const entity = {
      id: req.params.id,
    };
    //userModel.delete(entity)
  },
  update: async function (req, res, next) {},
};
