const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota para registrar presença
router.post('/registrar', (req, res) => {
  const { nome_aluno, turma, data, horario, conteudo } = req.body;

  const query = `INSERT INTO presencas (nome_aluno, turma, data, horario, conteudo) 
                 VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [nome_aluno, turma, data, horario, conteudo], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao registrar presença', details: err });
    }
    res.status(201).json({ message: 'Presença registrada com sucesso!' });
  });
});

// NOVA: Rota para obter todas as presenças
router.get('/listar', (req, res) => {
  db.query('SELECT * FROM presencas ORDER BY data DESC, horario DESC', (err, resultados) => {
    if (err) {
      console.error('Erro no MySQL:', err); // Log completo do erro no terminal
      return res.status(500).json({ error: 'Erro ao buscar presenças' });
    }
    res.json(resultados);
  });
});



module.exports = router;

