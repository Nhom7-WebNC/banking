const db = require('../utils/db');

module.exports = {
    add: entity =>{
        return db.add(entity, 'receiver');
    },
    findByAccountNumber : receiver_account_number => db.load(`select * from receiver where receiver_account_number = ${receiver_account_number}`),
    findById : id => db.load (`select  * from receiver where receiver_id = ${id}`),
    findByOtherName : other_name => db.load (`select  * from receiver where receiver_other_name = ${other_name}`),
};