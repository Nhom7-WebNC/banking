const db = require('../utils/db');

module.exports = {
    add: entity =>{
        return db.add(entity, 'transaction_history');
    },
    findByAccountNumber : receiver_account_number => db.load(`select * from transaction_history where receiver_account_number = ${receiver_account_number}`),
    findById : id => db.load (`select  * from transaction_history where receiver_id = ${id}`),
    
};