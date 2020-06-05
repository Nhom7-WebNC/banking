const db = require('../utils/db');

module.exports = {
    add: entity =>{
        return db.add(entity, 'account');
    },
    findByAccountNumber : account_number => db.load(`select * from account where account_number = ${account_number}`),
    findById : id => db.load (`select  * from account where id = ${id}`),
    findByUserId : id => db.load(`select * from account where id = ${id}`),
    updateMoney : (id, entity ) => db.update ('account' ,'user_id' ,id ,entity)  
};
