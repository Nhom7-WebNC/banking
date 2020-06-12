var mysql = require("mysql");
var config = require("./../utils/db");
var connection = mysql.createConnection(config.pool_query);
connection.connect();
module.exports = connection;
