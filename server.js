require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const capturaRoutes = require("./routes/capturaRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();
const cors = require("cors");
const path = require("path");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.use("/", capturaRoutes);
app.use("/", adminRoutes);

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB conectado com sucesso");
  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Servidor rodando na porta ${process.env.PORT || 3000}`);
  });
}).catch((err) => {
  console.error("❌ Erro ao conectar MongoDB:", err.message);
});
