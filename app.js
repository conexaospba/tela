require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Conexão com MongoDB com log
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB conectado com sucesso"))
.catch((err) => console.error("❌ Erro na conexão com MongoDB:", err));

// Validador de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  return resto === parseInt(cpf.charAt(10));
}

// Schema para salvar no MongoDB
const PixSchema = new mongoose.Schema({
  sessionID: String,
  nome: String,
  telefone: String,
  cpf: String,
  email: String,
  qrCode: String,
  qrCodeImage: String,
  valor: String,
  data: { type: Date, default: Date.now },
});
const PixModel = mongoose.model("Pix", PixSchema);

// Rota de criação do PIX
app.post("/criar-pix", async (req, res) => {
  try {
    const { nome, telefone, cpf, email, sessionID } = req.body;

    if (!nome || !telefone || !cpf || !email || !validarCPF(cpf)) {
      return res.status(400).json({ success: false, message: "Dados inválidos." });
    }

    const payload = {
      amount: 249.95,
      payment: { method: "pix", expiresAt: 48 },
      customer: {
        name: nome,
        cpf: cpf.replace(/\D/g, ""),
        email,
        phone: telefone,
      },
    };

    const response = await axios.post("https://api.risepay.com.br/api/External/Transactions", payload, {
      headers: {
        Authorization: process.env.RISEPAY_PRIVATE_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (response.data && response.data.success && response.data.object) {
      const novoPix = new PixModel({
        sessionID,
        nome,
        telefone,
        cpf,
        email,
        qrCode: response.data.object.qrCode,
        qrCodeImage: response.data.object.qrCodeImage,
        valor: "R$ 249,95",
      });
      await novoPix.save();
    }

    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro ao gerar Pix:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Erro ao gerar cobrança Pix." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
