var mysql = require('mysql2');
var database_name = 'Hotel_Management';

var connection = mysql.createConnection({
    host: 'localhost',
    database: database_name,
    user: 'root',
    password: 'root'
});

module.exports = connection;