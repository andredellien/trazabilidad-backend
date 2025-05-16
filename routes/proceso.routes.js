const express = require("express");
const router = express.Router();
const controller = require("../controllers/proceso.controller");

router.post("/", controller.crear);
router.get("/", controller.listar);
router.get("/:id", controller.obtenerUno);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);

module.exports = router;
