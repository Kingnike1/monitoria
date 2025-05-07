const express = require("express");
const sessoesRoutes = require("./routes/sessoes");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const presencaRoutes = require("./routes/presenca");
const bcrypt = require("bcryptjs");
const db = require("./config/db");
const PDFDocument = require("pdfkit");
const { parse } = require("json2csv");

const app = express();
const port = 3000;

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`Requisitado: ${req.url}`);
  next();
});

// Cabeçalho de segurança (opcional, mas recomendado)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// Configurar sessões
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware para ler JSON e form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de autenticação
function verificarAutenticacao(req, res, next) {
  if (!req.session.monitorId) {
    if (req.accepts("html")) {
      return res.redirect("/");
    } else {
      return res.status(401).json({ error: "Você precisa estar logado." });
    }
  }
  next();
}

// Página inicial (login)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.use("/sessoes", sessoesRoutes);

// Página protegida (monitor)
app.get("/monitor", verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "monitor.html"));
});

// Página protegida (registro)
app.get("/registro", verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "registro_presenca.html"));
});

// Rotas protegidas de presença
app.use("/presencas", verificarAutenticacao, presencaRoutes);

// Login
app.post("/login", async (req, res) => {
  if (req.session.monitorId) {
    return res.status(400).json({ error: "Você já está logado." });
  }

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ error: "Por favor, preencha todos os campos." });
  }

  db.query(
    "SELECT * FROM monitores WHERE email = ?",
    [email],
    async (err, results) => {
      if (err)
        return res.status(500).json({ error: "Erro ao buscar monitor." });

      if (results.length === 0) {
        return res.status(401).json({ error: "Email não encontrado." });
      }

      const monitor = results[0];
      const senhaCorreta = await bcrypt.compare(senha, monitor.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ error: "Senha incorreta." });
      }

      req.session.monitorId = monitor.id;
      req.session.monitorEmail = monitor.email;

      // Registrar hora de início da sessão
      const horaInicio = new Date()
        .toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
        .replace("T", " ");
      // Formato: 'YYYY-MM-DD HH:MM:SS'
      db.query(
        "INSERT INTO sessoes (monitor_id, hora_inicio) VALUES (?, ?)",
        [monitor.id, horaInicio],
        (err, results) => {
          if (err) {
            console.error("Erro ao registrar sessão:", err);
            return res.status(500).json({ error: "Erro ao registrar sessão." });
          }

          res.json({ message: "Login bem-sucedido e sessão registrada." });
        }
      );
    }
  );
});

// Logout
app.get("/logout", (req, res) => {
  if (!req.session.monitorId) {
    return res.status(400).json({ error: "Você não está logado." });
  }

  const horaFim = new Date()
    .toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
    .replace("T", " ");

  // Atualizar a hora de término da sessão
  db.query(
    "UPDATE sessoes SET hora_fim = ? WHERE monitor_id = ? AND hora_fim IS NULL",
    [horaFim, req.session.monitorId],
    (err, results) => {
      if (err) {
        console.error("Erro ao registrar término da sessão:", err);
        return res
          .status(500)
          .json({ error: "Erro ao registrar término da sessão." });
      }

      // Finaliza a sessão do monitor
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao fazer logout." });
        }
        res.redirect("/");
      });
    }
  );
});

// Cadastro
app.post("/cadastrar", async (req, res) => {
  if (req.session.monitorId) {
    return res.status(400).json({
      error: "Você já está logado. Não é necessário se cadastrar novamente.",
    });
  }

  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: "Por favor, preencha todos os campos." });
  }

  if (!email.endsWith("@monitora.com")) {
    return res
      .status(400)
      .json({ error: "O e-mail deve terminar com @monitora.com" });
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  db.query(
    "INSERT INTO monitores (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, senhaCriptografada],
    (err) => {
      if (err)
        return res.status(500).json({ error: "Erro ao cadastrar monitor." });

      res.json({ message: "Monitor cadastrado com sucesso!" });
    }
  );
});

app.get("/gerar-relatorio/pdf", verificarAutenticacao, (req, res) => {
  const sql = `
    SELECT p.id, p.nome_aluno, p.turma, p.data, p.horario, p.conteudo, m.nome AS nome_monitor
    FROM presencas p
    JOIN monitores m ON p.monitor_id = m.id
    ORDER BY p.data DESC, p.horario DESC
  `;

  db.query(sql, (err, presencas) => {
    if (err) {
      console.error("Erro ao buscar presenças:", err);
      return res.status(500).json({ error: "Erro ao gerar o relatório PDF" });
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=relatorio_presencas.pdf"
    );
    doc.pipe(res);

    doc.fontSize(16).text("Relatório de Presenças", { align: "center" });
    doc.moveDown();

    const formatarData = (dataISO) => {
      const d = new Date(dataISO);
      return d.toLocaleDateString("pt-BR");
    };

    presencas.forEach((p) => {
      doc
        .fontSize(12)
        .text(
          `ID: ${p.id} | Nome: ${p.nome_aluno} | Turma: ${
            p.turma
          } | Data: ${formatarData(p.data)} | Horário: ${p.horario.slice(
            0,
            5
          )} | Conteúdo: ${p.conteudo} | Monitor: ${p.nome_monitor}`
        );
      doc.moveDown(0.5);
    });

    doc.end();
  });
});

// Relatório CSV
app.get("/gerar-relatorio/csv", verificarAutenticacao, async (req, res) => {
  try {
    // Consulta de presenças com informações do monitor
    const presencas = await obterPresencas();

    // Gerar CSV a partir dos dados
    const csv = await gerarCsv(presencas);

    // Configurações de cabeçalho para download do arquivo CSV
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio_presencas.csv");

    // Envia o CSV para o cliente
    res.send(csv);

  } catch (error) {
    console.error("Erro ao gerar relatório CSV:", error);
    res.status(500).json({ error: "Erro ao gerar o relatório CSV" });
  }
});

// Função para obter as presenças com informações do monitor
const obterPresencas = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.id, p.nome_aluno, p.turma, p.data, p.horario, p.conteudo, m.nome AS nome_monitor
      FROM presencas p
      JOIN monitores m ON p.monitor_id = m.id
      ORDER BY p.data DESC, p.horario DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        reject("Erro ao buscar presenças.");
      } else {
        resolve(results);
      }
    });
  });
};

// Função para gerar o CSV a partir das presenças
const gerarCsv = (presencas) => {
  return new Promise((resolve, reject) => {
    try {
      const csv = parse(presencas, {
        fields: [
          "id", 
          "nome_aluno", 
          "turma", 
          "data", 
          "horario", 
          "conteudo", 
          "nome_monitor"
        ],
      });
      resolve(csv);
    } catch (error) {
      reject("Erro ao converter dados para CSV.");
    }
  });
};

// Página 404 personalizada (deve ficar por último)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
