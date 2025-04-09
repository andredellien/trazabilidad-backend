const { Router } = require("express");
const router = Router();
const variableProcesoController = require("../controllers/variableProceso.controller");

// GET: Listar todas las variables de proceso
router.get("/", variableProcesoController.getAll);

// GET: Obtener una variable de proceso por ID
router.get("/:id", variableProcesoController.getById);

// POST: Crear una nueva variable de proceso
router.post("/", variableProcesoController.create);

// PUT: Actualizar una variable de proceso
router.put("/:id", variableProcesoController.update);

// DELETE: Eliminar una variable de proceso
router.delete("/:id", variableProcesoController.remove);

module.exports = router;
