const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Função auxiliar para verificar campos obrigatórios
const validarCamposObrigatorios = (dados, campos) => {
  const erros = [];
  campos.forEach(campo => {
    if (!dados[campo] || dados[campo].trim() === '') {
      erros.push(`${campo} é obrigatório.`);
    }
  });
  return erros;
};

// Rota para registrar presença
// Rota para registrar presença
router.post('/registrar', async (req, res) => {
  const { nome_aluno, turma, data, horario, conteudo, monitor_id } = req.body;

  // Validação de campos obrigatórios
  const camposObrigatorios = ['nome_aluno', 'turma', 'data', 'horario', 'monitor_id'];
  const erros = validarCamposObrigatorios(req.body, camposObrigatorios);
  console.log('Dados recebidos:', req.body);

  if (erros.length > 0) {
    console.log('Erros de validação:', erros);
    return res.status(400).json({ error: erros.join(' ') });
  }

  // Sanitização simples para prevenir SQL injection
  const nomeAluno = nome_aluno.trim();
  const turmaTrimmed = turma.trim();
  const conteudoTrimmed = conteudo ? conteudo.trim() : ''; // Evitar erro de undefined em conteúdo

  // Consulta para inserir a presença no banco de dados
  const query = `
    INSERT INTO presencas (nome_aluno, turma, data, horario, conteudo, monitor_id)
    VALUES (?, ?, ?, ?, ?, ?)`;

  try {
    // Log da query para verificar valores
    console.log('Executando query:', query);
    console.log('Valores:', [nomeAluno, turmaTrimmed, data, horario, conteudoTrimmed, monitor_id]);

    db.query(query, [nomeAluno, turmaTrimmed, data, horario, conteudoTrimmed, monitor_id], (err, results) => {
      if (err) {
        // Log detalhado do erro SQL
        console.error('Erro ao executar a query SQL:', err);
        return res.status(500).json({ error: 'Erro ao registrar presença', details: err });
      }

      console.log('Presença registrada com sucesso:', results);
      res.status(201).json({ message: 'Presença registrada com sucesso!' });
    });
  } catch (error) {
    // Log do erro genérico de servidor
    console.error('Erro no servidor:', error);
    res.status(500).json({ error: 'Erro interno ao registrar presença.' });
  }
});



// Rota para obter todas as presenças
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

// Rota para listar monitores
router.get('/listar/monitor', (req, res) => {
  db.query('SELECT id, nome FROM monitores', (err, resultados) => {
    if (err) {
      console.error('Erro no MySQL:', err);
      return res.status(500).json({ error: 'Erro ao buscar os monitores' });
    }
    res.json(resultados);  // Retornando tanto o id quanto o nome
  });
});

module.exports = router;
