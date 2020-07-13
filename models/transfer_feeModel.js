const db = require('../utils/db');

module.exports = {
    add: entity =>{
        return db.add(entity, 'transfer_fee');
    },
    findByAccountNumber : receiver_account_number => db.load(`select * from receiver where receiver_account_number = ${receiver_account_number}`),
    findById : id => db.load (`select  * from receiver where receiver_id = ${id}`),
    
    
};