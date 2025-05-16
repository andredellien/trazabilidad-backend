const express = require("express");
const router = express.Router();
const controller = require("../controllers/procesoTransformacion.controller");

router.post("/:idLote/maquina/:numeroMaquina", controller.registrarFormulario);
router.get("/:idLote/maquina/:numeroMaquina", controller.obtenerFormulario);

// ✅ Nuevo endpoint: máquinas y variables del proceso asignado a un lote
router.get("/lote/:idLote", controller.obtenerProcesoDeLote);

module.exports = router;
