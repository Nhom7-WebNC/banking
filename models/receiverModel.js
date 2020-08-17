const db = require("../utils/db");

module.exports = {
  add: (entity) => {
    return db.add(entity, "receiver_list");
  },
  delete: (entity) => {
    return db.delete(entity, "receiver_list");
  },
  findByAccountNumber: (receiver_account_number) =>
    db.load(`select * from receiver_list where receiver_account_number = ${receiver_account_number}`),
  findByUserId: (id) => db.load(`select  * from receiver_list where user_id = ${id}`),
  findByUserIdAndBankCode: async (user_id, bank_code) => {
    if (bank_code != "") {
      return db.load(`select  * from receiver_list where user_id = ${user_id} and bank_code = '${bank_code}'`);
    } else {
      return db.load(`select * from receiver_list where user_id = '${user_id}'`);
    }
  },

  findOne: (field, value) => {
    return db.load(`select * from receiver_list where ${field} = '${value}'`);
  },
  updateByOne: (field, value, entity) => {
    return db.update("receiver_list", field, value, entity);
  },
};
