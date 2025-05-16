const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

const maquinaController = require("../controllers/maquina.controller");

// 📤 Subir imagen a Cloudinary
router.post("/upload", upload.single("imagen"), async (req, res) => {
	try {
		if (!req.file || !req.file.path) {
			return res.status(400).json({ message: "Archivo no recibido" });
		}
		res.json({ imageUrl: req.file.path });
	} catch (error) {
		console.error("Error al subir imagen:", error);
		res.status(500).json({ message: "Error al subir imagen" });
	}
});

// 📄 Guardar máquina con nombre e imagen
router.post("/", maquinaController.crear);

// 📋 Listar todas las máquinas
router.get("/", maquinaController.listar);

module.exports = router;
