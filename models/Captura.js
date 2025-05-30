const mongoose = require("mongoose");

const capturaSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['progresso', 'final'], required: true },
  dados: { type: Object, required: true },
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Captura", capturaSchema);
