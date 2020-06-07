var express = require('express');
var router = express.Router();
const moment = require("moment");
const config = require("../config/default.json");

const userModel = require("../models/userModel");

/* GET users listing. */
router.get('/', (req, res) => {              
  res.json('Welcome to userRoute');
});


router.post("/add", async (req, res) => {
  console.log(req.body);
  try {
    const result = await userModel.add(req.body);
    const ret = {
      // id: result.insertId,
      ...req.body,
      created_at : new Date()
    };

    delete ret.password;
    res.status(201).json(ret);
  } catch (err) {
    console.log("error: ", err.message);
    return res.status(500).send({ message: "Error." });
  }
});


const confirm = (req) => {
  const ts = +req.get("ts"); // const ts = +req.headers['ts'];
  const partnerCode = req.get("partnerCode");
  const sig = req.get("sig");
  let hashSecretKey; // = md5(config.auth.secretPartner);
  const currentTime = moment().valueOf();

  if (currentTime - ts > config.auth.expireTime) {
    return 1;
  }

  if (partnerCode != config.auth.partnerRSA && partnerCode != config.auth.partnerPGP  && partnerCode != config.auth.partnerForTestRSA) {
    //điền Code của bank - partner
    return 2;
  }

  if (partnerCode == config.auth.partnerRSA) {
    hashSecretKey = md5(config.auth.secretPartnerRSA);
  }
  if (partnerCode == config.auth.partnerPGP) {
    hashSecretKey = md5(config.auth.secretPartnerPGP);
  }
  if (partnerCode == config.auth.partnerForTestRSA) {
    hashSecretKey = md5(config.auth.secretPartnerForTestRSA);
  }
  const comparingSign = md5(ts + JSON.stringify(req.body) + hashSecretKey);

  if (sig != comparingSign) {
    return 3;
  }

  if (!req.body.user_id) {
    return 4;
  } else {
    return 0;
  }
};

router.get("/", (req, res) => {
    next();  // chưa có
});

router.get("/customer", async (req, res) => {
  
  
  var con = confirm(req);
  if (con == 1) {
    return res.status(400).send({
      message: "The request was out of date.", // quá hạn
    });
  }

  if (con == 2) {
    return res.status(400).send({
      message: "You are not one of our partners.",
    });
  }

  if (con == 3) {
    return res.status(400).send({
      message: "The file was changed by strangers.",
    });
  }

  if (con == 4) {
    return res.status(400).send({
      message: "Missing user ID.",
    });
  }
  
  try {
    // console.log("req body", req.body.id);
    const rows = await userModel.findById(req.body.user_id);
    // console.log("12345");
    if (rows.length == 0) {
      return res.status(403).send({ message: `No user has id ${req.body.user_id}` });
    } else {
      const ret = {
        username: rows[0].username,
        name: rows[0].name,
        personal_number: rows[0].personal_number,
        birthday: rows[0].birthday,
        phone: rows[0].phone,
        address: rows[0].address,
        email: rows[0].email,
        gender: rows[0].gender,
      };

      return res.status(200).send(ret);
    }
  } catch (err) {
    console.log("error: ", err.message);
    return res.status(500).send({ message: "Error." });
  }
});




module.exports = router;
