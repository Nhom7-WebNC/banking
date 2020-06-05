const db = require('../utils/db');

module.exports = {
    add: entity =>{
        return db.add(entity, 'otp');
    },
    findByCode : code => db.load(`select * from bank where otp_code = ${code}`),
    findById : id => db.load (`select  * from bank where otp_id = ${id}`),
    findByTransactionId : id => db.load (`select  * from bank where transaction_id = ${id}`),
};