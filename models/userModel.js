const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const moment = require("moment");
module.exports = {
  add: (entity) => {
    return db.add(entity, "user");
  },
  findAll: () => db.load(`select * from user`),
  findOne: (field, value) => {
    return db.load(`select * from user where ${field} = '${value}'`);
  },
  delete: (entity) => {
    return db.delete(entity, "user");
  },
  updateByOne: (field, value, entity) => {
    
    return db.update("user", field, value, entity);
  },
};
//ssd*dd
