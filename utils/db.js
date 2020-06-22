const mysql = require("mysql");
const { promisify } = require("util");
const config = require("../config/default.json");

const pool = mysql.createPool(config.mysql);
const pool_query = promisify(pool.query).bind(pool);
console.log("connect db.js");
module.exports = {
  load: (sql) => pool_query(sql),
  add: (entity, tableName) => pool_query(`insert into ${tableName} set ?`, entity),

  update: (tableName, idField, id, entity) =>
    pool_query(`update ${tableName} set ? where ${idField} = ${id} `, entity),
  delete: (condition, tableName) => pool_query(`delete from ${tableName} where ? `, condition),
};
