var express = require("express");
var router = express.Router();
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = {
  signup: function (req, res) {
    const password = req.body.password;

    const user = userModel.findOne("username", req.body.username).then((rows) => {
      if (rows.length > 0) {
        res.status(403).json({ msg: "tai khoan da ton tai" });
      } else {
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
            userModel.add(newUserMysql);
            return res.status(201).json("dang ki thanh cong" + { newUserMysql });
          });
        });
      }
    });
  },
  login: async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    userModel.findOne("username", username).then(async (rows, err) => {
      if (rows.length <= 0) {
        res.status(401).json({ mes: "Tai khoan khong ton tai" });
      } else {
        const compare = bcrypt.compareSync(password, rows[0].password);
        console.log(compare);
        const user = { name: username, password: password, role_name: rows[0].role_name };
        if (compare) {
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
          res.json({ accessToken: accessToken });
        } else {
          res.status(401).json({ mes: "Sai mat khau" });
        }
      }
    });
  },
};
