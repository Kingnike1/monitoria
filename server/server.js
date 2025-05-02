const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const presencaRoutes = require('./routes/presenca');
const bcrypt = require('bcryptjs');
const db = require('./config/db');  // Atualize de acordo com sua conexão com o banco
const PDFDocument = require('pdfkit');
const { parse } = require('json2csv');

const router = express.Router();

const app = express();
const port = 3000;

// Middleware para interpretar JSON
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rota raiz que envia o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});
app.use(express.static('public'));

// Rotas de presença
app.use('/presencas', presencaRoutes);

app.use(session({
  secret: 'secret-key', // Chave secreta para criptografar a sessão
  resave: false,
  saveUninitialized: false
}));

// Middleware para verificar se o monitor está logado
function verificarAutenticacao(req, res, next) {
  if (!req.session.monitorId) {
    return res.status(401).json({ error: 'Você precisa estar logado para acessar esta página.' });
  }
  next();
}

// Rota para login - disponível apenas se o monitor NÃO estiver logado
app.post('/login', async (req, res) => {
  if (req.session.monitorId) {
    return res.status(400).json({ error: 'Você já está logado.' });
  }

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  // Busca o monitor pelo email
  db.query('SELECT * FROM monitores WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar monitor' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email não encontrado.' });
    }

    const monitor = results[0];

    // Verifica se a senha fornecida corresponde à senha criptografada
    const senhaCorreta = await bcrypt.compare(senha, monitor.senha);
    
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    // Salva a sessão de login
    req.session.monitorId = monitor.id;
    req.session.monitorEmail = monitor.email;

    res.json({ message: 'Login bem-sucedido' });
  });
});

// Rota para cadastro - disponível apenas se o monitor NÃO estiver logado
app.post('/cadastrar', async (req, res) => {
  if (req.session.monitorId) {
    return res.status(400).json({ error: 'Você já está logado. Não é necessário se cadastrar novamente.' });
  }

  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  db.query('INSERT INTO monitores (email, senha) VALUES (?, ?)', [email, senhaCriptografada], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao cadastrar monitor' });

    res.json({ message: 'Monitor cadastrado com sucesso!' });
  });
});

// Rota protegida - apenas para monitores logados
app.get('/monitor', verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'monitor.html'));
});

// Rota para logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao realizar logout.' });
    }
    res.json({ message: 'Logout realizado com sucesso.' });
  });
});

// Rota para gerar relatório em PDF com os dados das presenças
app.get('/gerar-relatorio/pdf', (req, res) => {
  // Buscando os dados de presenças do banco
  db.query('SELECT * FROM presencas ORDER BY data DESC, horario DESC', (err, presencas) => {
    if (err) {
      console.error('Erro ao buscar presenças:', err);
      return res.status(500).json({ error: 'Erro ao gerar o relatório PDF' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_presencas.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Relatório de Presenças', { align: 'center' });
    doc.moveDown();

    // Adicionando as presenças no PDF
    presencas.forEach(presenca => {
      doc.fontSize(12).text(
        `ID: ${presenca.id} - Nome: ${presenca.nome} - Data: ${presenca.data} - Horário: ${presenca.horario}`
      );
    });

    doc.end();
  });
});

// Rota para gerar relatório em CSV com os dados das presenças
app.get('/gerar-relatorio/csv', (req, res) => {
  // Buscando os dados de presenças do banco
  db.query('SELECT * FROM presencas ORDER BY data DESC, horario DESC', (err, presencas) => {
    if (err) {
      console.error('Erro ao buscar presenças:', err);
      return res.status(500).json({ error: 'Erro ao gerar o relatório CSV' });
    }

    // Convertendo os dados para CSV
    const csv = parse(presencas);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_presencas.csv');

    res.send(csv);
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
