const db = require("../utils/db");

module.exports = {
  add: (entity) => {
    return db.add(entity, "account");
  },

  findOne: (field, value) => {
    return db.load(`select * from account where ${field} = '${value}'`);
  },

  findCustom: (field) => {
    return db.load(`select ${field} from account`);
  },

  updateCheckingMoney: async (checking_account_number, amount) => {
    const account = await db.load(
      `select * from account where checking_account_number = ${checking_account_number}`
    );
    db.load(
      `UPDATE account SET checking_account_amount = ${amount} WHERE checking_account_number = ${checking_account_number}`
    );
    console.log("account_number", checking_account_number);
    console.log("amount", amount);
  },
};
