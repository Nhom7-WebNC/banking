var express = require("express");
var router = express.Router();
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/default.json");
const auth = require("../middlewares/auth.mdw");
module.exports = {
  refreshToKen: function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password);
    if (typeof username == "undefined" || typeof password == "undefined") {
      res.status(401);
      return "hi";
    }
    userModel.findOne("username", username).then(async (rows, err) => {
      if (rows.length <= 0) {
        res.status(401);
      } else {
        const compare = bcrypt.compareSync(password, rows[0].password);

        if (compare) {
          const accessToken = auth.generateAuthToken(user);
          const refreshToken = await auth.generateRefreshToken(user).then((rows) => {
            console.log("rows", rows);
            console.log("accessToken", accessToken);
            res.status(200).json({
              accessToken: accessToken,
              refreshToken: rows,
            });
          });
        } else {
          res.status(401);
        }
      }
    });
    res.status(401);
  },

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
        res.status(401).json({ msg: "đăng nhập không thành công" });
      } else {
        const compare = bcrypt.compareSync(password, rows[0].password);
        const user = { username: username, id: rows[0].id, role: rows[0].role_name };

        if (compare) {
          const accessToken = auth.generateAuthToken(user);
          const refreshToken = await auth.generateRefreshToken(user).then((rows) => {
            res.status(200).json({
              accessToken: accessToken,
              refreshToken: rows,
            });
          });
        } else {
          res.status(401).json({ msg: "đăng nhập không thành công" });
        }
      }
    });
  },
};
