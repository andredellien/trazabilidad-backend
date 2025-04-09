const { Router } = require("express");
const router = Router();
const controlCalidadController = require("../controllers/controlCalidad.controller");

// GET: Listar todos los controles de calidad
router.get("/", controlCalidadController.getAll);

// GET: Obtener un control de calidad por ID
router.get("/:id", controlCalidadController.getById);

// POST: Crear un nuevo control de calidad
router.post("/", controlCalidadController.create);

// PUT: Actualizar un control de calidad
router.put("/:id", controlCalidadController.update);

// DELETE: Eliminar un control de calidad
router.delete("/:id", controlCalidadController.remove);

module.exports = router;
