const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota para registrar presença
router.post('/registrar', (req, res) => {
  const { nome_aluno, turma, data, horario, conteudo, monitor_id } = req.body;

  if (!monitor_id) {
    return res.status(400).json({ error: 'monitor_id é obrigatório.' });
  }

  const query = `
    INSERT INTO presencas (nome_aluno, turma, data, horario, conteudo, monitor_id)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(query, [nome_aluno, turma, data, horario, conteudo, monitor_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao registrar presença', details: err });
    }
    res.status(201).json({ message: 'Presença registrada com sucesso!' });
  });
});

// NOVA: Rota para obter todas as presenças
router.get('/listar', (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.nome_aluno,
      p.turma,
      p.data,
      p.horario,
      p.conteudo,
      m.nome AS nome_monitor
    FROM presencas p
    LEFT JOIN monitores m ON p.monitor_id = m.id
    ORDER BY p.data DESC, p.horario DESC
  `;

  db.query(query, (err, resultados) => {
    if (err) {
      console.error('Erro no MySQL:', err);
      return res.status(500).json({ error: 'Erro ao buscar presenças' });
    }
    res.json(resultados);
  });
});


router.get('/listar/monitor', (req, res) => {
  db.query('SELECT nome FROM monitores',(err, resultados) => {
    if(err){
      console.error('Erro no MySQL:', err);
      return res.status(500).json({error: 'Erro ao buscar os monitores'});
    }
    res.json(resultados);
  });
});


module.exports = router;

