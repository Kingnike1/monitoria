const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'db',            // nome do serviço do banco no docker-compose.yml
  user: 'root',
  password: '123',
  database: 'monitoria',
  port: 3306             // porta interna do container
});

db.connect((err) => {
  if (err) throw err;
  console.log('🟢 Conectado ao MySQL!');
});

module.exports = db;
