const { Router } = require("express");
const router = Router();
const operadorController = require("../controllers/operador.controller");
const verifyToken = require("../middlewares/verifyToken");

// Proteger todas las rutas con el middleware de verificación de token
router.use(verifyToken);

// GET: Listar todos los operadores
router.get("/", operadorController.getAll);

// GET: Obtener un operador por ID
router.get("/:id", operadorController.getById);

// POST: Crear un nuevo operador
router.post("/", operadorController.create);

// PUT: Actualizar un operador
router.put("/:id", operadorController.update);

// DELETE: Eliminar un operador
router.delete("/:id", operadorController.remove);

// Nuevas rutas para manejo de máquinas
router.post("/:id/maquinas", operadorController.asignarMaquinas);
router.get("/:id/maquinas", operadorController.obtenerMaquinasAsignadas);

module.exports = router;
