const db = require('../utils/db');

module.exports = {
    add: entity =>{
        return db.add(entity, 'role');
    },
    findById : id => db.load (`select  * from role where role_id = ${id}`)
};