const mysql = require('mysql');

const db = mysql.createConnection({
  host: '127.0.0.1',      // ou '127.0.0.1'
  user: 'root',           // ou o usuário definido no Docker
  password: '123',  // senha definida no docker run -e MYSQL_ROOT_PASSWORD
  database: 'monitoria',  // nome do banco criado
  port: 3307              // ✅ porta correta conforme Docker
});

db.connect((err) => {
  if (err) throw err;
  console.log('🟢 Conectado ao MySQL!');
});

module.exports = db;
