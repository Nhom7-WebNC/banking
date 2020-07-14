const db = require("../utils/db");

module.exports = {
  add: (entity) => {
    return db.add(entity, "receiver_list");
  },
  findByAccountNumber: (receiver_account_number) =>
    db.load(`select * from receiver_list where receiver_account_number = ${receiver_account_number}`),
  findByUserId: (id) => db.load(`select  * from receiver_list where user_id = ${id}`),
  findByUserIdAndBankCode: (user_id, bank_code) =>
    db.load(`select  * from receiver_list where user_id = ${user_id} and bank_code = '${bank_code}'`),
  findOne: (field, value) => {
    return db.load(`select * from account where ${field} = '${value}'`);
  },
};
