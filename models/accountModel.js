const db = require("../utils/db");

module.exports = {
  add: (entity) => {
    return db.add(entity, "account");
  },

  findOne: (field, value) => {
    return db.load(`select * from account where ${field} = '${value}'`);
  },
<<<<<<< HEAD
  findCustom: (field) =>{
    return db.load(`select ${field} from account`);
  },
  findByUserId: (id) => db.load(`select * from account where id = ${id}`),
=======
  findUserIdByAccountNumber: () => {
    return db.load(`select user from account where checking_account_number = ${checking_account_number} 
          
    `);
  },
>>>>>>> fa62c0519a1043c88ab43e99c7b5fca374813b7d
  updateCheckingMoney: async (checking_account_number, amount) => {
    const account = await db.load(
      `select * from account where checking_account_number = ${checking_account_number}`
    );

    const amountNew = account[0].checking_account_amount + amount;
    console.log("account", amountNew);
    console.log("account", account[0].checking_account_amount);
    console.log("account", amount);

    db.load(
      `UPDATE account SET checking_account_amount = ${amountNew} WHERE checking_account_number = ${checking_account_number}`
    );
  },
};
