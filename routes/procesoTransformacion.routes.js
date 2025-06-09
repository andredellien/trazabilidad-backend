const express = require("express");
const router = express.Router();
const controller = require("../controllers/procesoTransformacion.controller");
const verifyToken = require("../middlewares/verifyToken");

// Proteger todas las rutas con el middleware de verificación de token
router.use(verifyToken);

router.post("/:idLote/maquina/:numeroMaquina", controller.registrarFormulario);
router.get("/:idLote/maquina/:numeroMaquina", controller.obtenerFormulario);

// ✅ Nuevo endpoint: máquinas y variables del proceso asignado a un lote
router.get("/lote/:idLote", controller.obtenerProcesoDeLote);

module.exports = router;
