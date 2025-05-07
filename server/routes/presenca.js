const express = require('express');
const router = express.Router();
const db = require('../config/db');
const moment = require("moment-timezone");



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

// Rota para registrar presença com base em uma sessão existente
router.post("/registrar", async (req, res) => {
  const { nome_aluno, turma, conteudo, sessao_id } = req.body;

  if (!nome_aluno || !turma || !sessao_id) {
    return res
      .status(400)
      .json({ error: "Nome do aluno, turma e sessão são obrigatórios." });
  }

  const nomeAluno = nome_aluno.trim();
  const turmaTrimmed = turma.trim();
  const conteudoTrimmed = conteudo ? conteudo.trim() : "";

  try {
    const sessaoQuery = "SELECT monitor_id FROM sessoes WHERE id = ?";
    db.query(sessaoQuery, [sessao_id], (err, results) => {
      if (err) {
        console.error("Erro ao buscar sessão:", err);
        return res
          .status(500)
          .json({ error: "Erro ao buscar dados da sessão." });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Sessão não encontrada." });
      }

      const { monitor_id } = results[0];

      // Captura a data e hora atual em horário de Brasília
      const dataAtual = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD");
      const horaAtual = moment().tz("America/Sao_Paulo").format("HH:mm:ss");

      const insertQuery = `
        INSERT INTO presencas (nome_aluno, turma, data, horario, conteudo, monitor_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          nomeAluno,
          turmaTrimmed,
          dataAtual,
          horaAtual,
          conteudoTrimmed,
          monitor_id,
        ],
        (err, insertResult) => {
          if (err) {
            console.error("Erro ao registrar presença:", err);
            return res
              .status(500)
              .json({ error: "Erro ao registrar presença." });
          }

          res.status(201).json({ message: "Presença registrada com sucesso!" });
        }
      );
    });
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: "Erro interno ao registrar presença." });
  }
});


// Rota para obter todas as presenças com data e hora formatadas
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

    // Formatar a data e o horário
    const presencasFormatadas = resultados.map(presenca => {
      const dataObj = new Date(presenca.data);
      return {
        ...presenca,
        data: dataObj.toLocaleDateString('pt-BR'), // ex: 05/05/2025
        horario: presenca.horario.slice(0, 5) // ex: 15:00
      };
    });

    res.json(presencasFormatadas);
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
