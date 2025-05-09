const express = require("express");
const router = express.Router();
const controller = require("../controllers/procesoEvaluacion.controller");

router.post("/finalizar/:idLote", controller.finalizarProceso);
router.get("/log/:idLote", controller.obtenerLog);

module.exports = router;
