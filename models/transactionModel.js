const db = require("../utils/db");

module.exports = {
  add: (entity) => {
    return db.add(entity, "transaction_history");
  },
  findOne: (field, value) => {
    return db.load(`select * from transaction_history where ${field} = '${value}'`);
  },
  findAll: () => db.load(`select * from transaction_history`),
  findByAccountNumber: (account_number) =>
    db.load(
      `select * from transaction_history where receiver_account_number = ${account_number} or sender_account_number =${account_number}`
    ),
  findById: (id) =>
    db.load(`select  * from transaction_history where receiver_id = ${id}`),
  findByReciverAccountNumber: (account_number) =>
    db.load(
      `select * from transaction_history where receiver_account_number = ${account_number}`
    ),
  findBySenderAccountNumber: (account_number) =>
    db.load(
      `select * from transaction_history where sender_account_number = ${account_number}`
    ),
  findByBankcode: (bank_code) =>
    db.load(
      `select * from transaction_history where sender_bank_code='${bank_code}' or receiver_bank_code='${bank_code}'`
    ),
  findByTime: (dateStart, dateEnd) =>
    db.load(
      `select * from transaction_history where created_at BETWEEN '${dateStart}' AND '${dateEnd}'`
    ),
};
