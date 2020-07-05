const jwt = require("jsonwebtoken");
const craeteError = require("http-errors");
const db = require("../utils/db");

const config = require("../config/default.json");

module.exports = {
  generateAuthToken: (entity) => {
    const { user } = entity;
    const token = jwt.sign({ user: user }, "access", { expiresIn: "1d" });
    return token;
  },

  generateRefreshToken: async (entity) => {
    let dayExpire = "10";
    let secondsExpire = dayExpire * 24 * 60 * 60;
    const expiresAt = Date.now() / 1000 + secondsExpire;

    const username = entity.username;
    const token = jwt.sign({ _id: entity.username }, "refresh");
    const a = await db.load(`UPDATE user SET token = "${token}" WHERE username = "${username}"`);

    const b = await db.load(`UPDATE user SET expries_at= "${expiresAt}" WHERE username = "${username}"`);
    return token;
  },
  refreshTokenExpired: (time) => {
    const result = time > Date.now() / 1000 ? false : true;
    return result;
  },
};
