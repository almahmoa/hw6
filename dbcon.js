var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host  : 'classmysql.engr.oregonstate.edu',
  user  : 'cs290_almahmoa',
  password: '7181',
  database: 'cs290_almahmoa'
});

module.exports.pool = pool;