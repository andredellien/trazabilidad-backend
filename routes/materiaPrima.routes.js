// routes/materiaPrima.routes.js
const { Router } = require("express");
const router = Router();
const materiaPrimaController = require("../controllers/materiaPrima.controller");

// GET: Listar todas
router.get("/", materiaPrimaController.getAll);

// GET: Obtener por ID
router.get("/:id", materiaPrimaController.getById);

// POST: Crear nueva
router.post("/", materiaPrimaController.create);

// PUT: Actualizar
router.put("/:id", materiaPrimaController.update);

// DELETE: Eliminar
router.delete("/:id", materiaPrimaController.remove);

module.exports = router;
