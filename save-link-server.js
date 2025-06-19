const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

app.post('/save-link', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'URL não fornecida.' });
  fs.appendFile('fotos.txt', url + '\n', err => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao salvar.' });
    res.json({ success: true });
  });
});

app.get('/links', (req, res) => {
  fs.readFile('fotos.txt', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao ler arquivo.' });
    res.json({ success: true, links: data.split('\n').filter(Boolean) });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de links rodando em http://localhost:${PORT}`);
});
