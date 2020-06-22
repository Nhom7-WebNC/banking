const db = require("../utils/db");

module.exports = {
  add: (entity) => {
    return db.add(entity, "otp");
  },
  findOne: (field, value) => {
    return db.load(`select * from account where ${field} = '${value}'`);
  },
  updateOTPCode: async (checking_account_number, otp_code) => {
    const account = await db.load(
      `select * from account where checking_account_number = ${checking_account_number}`
    );
    console.log(account[0].checking_account_number);
    db.load(
      `UPDATE account SET otp_code = ${otp_code} WHERE checking_account_number = ${checking_account_number}`
    );
  },
};
