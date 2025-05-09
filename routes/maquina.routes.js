const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/maquinas", (req, res) => {
	const ruta = path.join(__dirname, "..", "config", "variablesEstandar.json");

	try {
		const data = fs.readFileSync(ruta, "utf8");
		const maquinas = JSON.parse(data);
		res.json(maquinas);
	} catch (error) {
		console.error("Error al leer variablesEstandar:", error);
		res.status(500).json({ error: "Error al obtener máquinas" });
	}
});

module.exports = router;
