const express = require("express");
const router = express.Router();
const controller = require("../controllers/almacenaje.controller");

router.get("/", controller.getAll);
router.get("/lote/:idLote", controller.getByLote);
router.post("/", controller.create);

module.exports = router; 