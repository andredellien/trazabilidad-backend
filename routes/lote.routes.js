// routes/lote.routes.js
const express = require("express");
const router = express.Router();
const loteController = require("../controllers/lote.controller");

router.post("/", loteController.create); // Crear lote
router.get("/", loteController.getAll); // Listar todos
router.get("/:id", loteController.getById); // Obtener por ID
router.put("/:id", loteController.update); // Actualizar lote
router.delete("/:id", loteController.remove); // Eliminar lote

module.exports = router;
