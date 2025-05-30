const express = require("express");
const router = express.Router();
const Captura = require("../models/Captura");

// Buscar dados por tipo (progresso ou final)
router.get("/admin/dados/:tipo", async (req, res) => {
  try {
    const tipo = req.params.tipo;
    if (!["progresso", "final"].includes(tipo)) {
      return res.status(400).json({ erro: "Tipo inválido" });
    }
    const dados = await Captura.find({ tipo }).sort({ data: -1 });
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

// Limpar dados de um tipo específico
router.delete("/admin/limpar/:tipo", async (req, res) => {
  try {
    const tipo = req.params.tipo;
    if (!["progresso", "final"].includes(tipo)) {
      return res.status(400).json({ erro: "Tipo inválido" });
    }
    await Captura.deleteMany({ tipo });
    res.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

module.exports = router;
