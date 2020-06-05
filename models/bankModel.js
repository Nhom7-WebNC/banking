const db = require('../utils/db');

module.exports = {
    add: entity =>{
        return db.add(entity, 'bank');
    },
    findByCode : code => db.load(`select * from bank where bank_code = ${code}`),
    findById : id => db.load (`select  * from bank where bank_id = ${id}`),
};