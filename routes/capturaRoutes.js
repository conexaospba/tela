const express = require("express");
const router = express.Router();
const capturaController = require("../controllers/capturaController");

router.post("/captura-progresso", capturaController.salvarCaptura);
router.post("/captura-final", capturaController.salvarCaptura);

module.exports = router;
