const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const moment = require("moment");
module.exports = {
  add: (entity) => {
    return db.add(entity, "debt_reminder");
  },
  findAll: () => db.load(`select * from debt_reminder`),
  findOne: (field, value) => {
    return db.load(`select * from debt_reminder where ${field} = '${value}'`);
  },
  delete: (entity) => {
    return db.delete(entity, "debt_reminder");
  },
  updateByOne: (field, value, entity) => {
    return db.update("debt_reminder", field, value, entity);
  },
  findByAccountNumber: (account_number) => {
    return db.load(
      `select * from debt_reminder where creditor_account_number = ${account_number} or debtor_account_number =${account_number}`
    );
  },
};
//ssd*dd
