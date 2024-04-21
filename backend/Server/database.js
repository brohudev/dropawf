require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('node:fs');
const mysql = require('mysql');

var connectionPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    ca: fs.readFileSync(
      __dirname + "/helpers/DigiCertGlobalRootCA.crt.pem"
    ),
  },
  multipleStatements: true,
});

connectionPool.getConnection((err, connection) => {
  if (err) return console.error('Error connecting to MySQL database:', err.stack);
  console.log('Connected to MySQL database as id', connection.threadId);
  connection.release()
  
});

module.exports = connectionPool;
