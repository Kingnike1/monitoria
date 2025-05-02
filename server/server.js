const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path'); // necessário para trabalhar com caminhos de arquivos
const presencaRoutes = require('./routes/presenca');
const bcrypt = require('bcryptjs');
const db = require('./config/db');  // Atualize de acordo com sua conexão com o banco



const app = express();
const port = 3000;

// Middleware para interpretar JSON
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rota raiz que envia o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Rotas de presença
app.use('/presencas', presencaRoutes);



app.use(bodyParser.json());
app.use(express.static('public'));  // Serve arquivos estáticos como HTML, CSS, JS
app.use(session({
  secret: 'secret-key', // Chave secreta para criptografar a sessão
  resave: false,
  saveUninitialized: false
}));

// Rota para login
app.post('/login', async (req, res) => {
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

// Middleware para verificar se o monitor está logado
function verificarAutenticacao(req, res, next) {
  if (!req.session.monitorId) {
    return res.status(401).json({ error: 'Você precisa estar logado para acessar esta página.' });
  }
  next();
}

// Rota protegida - apenas para monitores logados
app.get('/monitor', verificarAutenticacao, (req, res) => {
  res.sendFile(__dirname + '/public/monitor.html');
});

app.post('/cadastrar', async (req, res) => {
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

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
