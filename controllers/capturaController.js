const Captura = require("../models/Captura");

exports.salvarCaptura = async (req, res) => {
  try {
    const tipo = req.path.includes("progresso") ? "progresso" : "final";
    const novaCaptura = new Captura({
      tipo,
      dados: req.body
    });
    await novaCaptura.save();
    res.status(201).json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao salvar captura:", error);
    res.status(500).json({ sucesso: false, erro: "Erro no servidor" });
  }
};
