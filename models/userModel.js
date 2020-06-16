const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const moment = require("moment");
module.exports = {
  add: (entity) => {
    entity.created_at = moment().format("YYYY-MM-DD");
    return db.add(entity, "user");
  },
  findAll: () => db.load(`select * from user`),
  findOne: (field, value) => {
    return db.load(`select * from user where ${field} = '${value}'`);
  },
};
//ssd*dd
