const express = require("express");
const router = express.Router();
const controller = require("../controllers/procesoTransformacion.controller");

router.post("/:idLote/maquina/:numeroMaquina", controller.registrarFormulario);
router.get("/:idLote/maquina/:numeroMaquina", controller.obtenerFormulario);

module.exports = router;
