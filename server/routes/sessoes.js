const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Middleware de autenticação
function verificarAutenticacao(req, res, next) {
  if (!req.session.monitorId) {
    if (req.accepts('html')) {
      return res.redirect('/');
    } else {
      return res.status(401).json({ error: 'Você precisa estar logado.' });
    }
  }
  next();
}

// Rota para obter sessões ativas
router.get("/ativas", (req, res) => {
  const query = `
    SELECT s.id, s.hora_inicio, s.hora_fim, m.nome AS monitor_nome
    FROM sessoes s
    JOIN monitores m ON s.monitor_id = m.id
    WHERE s.hora_fim IS NULL
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar sessões:", err);
      return res.status(500).json({ error: "Erro ao buscar sessões." });
    }

    res.json(results);
  });
});

module.exports = router;
