const transactionModel = require("../models/transactionModel");
const express = require("express");
const bcrypt = require("bcryptjs");
var router = express.Router();
module.exports = {
  getAll: async function (req, res, next) {
    const data = transactionModel.findAll().then((rows) => {
      console.log(rows);
      res.status(200).json({ rows });
    });
  },
};
