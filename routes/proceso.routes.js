const { Router } = require("express");
const router = Router();
const procesoController = require("../controllers/proceso.controller");

// GET: Listar todos los procesos
router.get("/", procesoController.getAll);

// GET: Obtener proceso por ID
router.get("/:id", procesoController.getById);

// POST: Crear un nuevo proceso
router.post("/", procesoController.create);

// PUT: Actualizar un proceso
router.put("/:id", procesoController.update);

// DELETE: Eliminar un proceso
router.delete("/:id", procesoController.remove);

module.exports = router;
