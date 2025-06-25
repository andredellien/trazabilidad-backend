const express = require("express");
const router = express.Router();
const controller = require("../controllers/logMateriaPrima.controller");

router.get("/", controller.getAll);
router.get("/base/:idMateriaPrimaBase", controller.getByMateriaPrimaBase);

module.exports = router; 