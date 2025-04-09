const { Router } = require("express");
const router = Router();
const loteController = require("../controllers/lote.controller");

// GET: Listar todos los lotes
router.get("/", loteController.getAll);

// GET: Obtener un lote por ID
router.get("/:id", loteController.getById);

// POST: Crear un nuevo lote
router.post("/", loteController.create);

// PUT: Actualizar un lote
router.put("/:id", loteController.update);

// DELETE: Eliminar un lote
router.delete("/:id", loteController.remove);

module.exports = router;
