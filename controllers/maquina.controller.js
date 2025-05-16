const model = require("../models/maquina.model");

async function crear(req, res) {
	try {
		const { nombre, imagenUrl } = req.body;

		if (!nombre || !imagenUrl) {
			return res.status(400).json({ message: "Nombre e imagen requeridos" });
		}

		const id = await model.crearMaquina({ nombre, imagenUrl });
		res.status(201).json({ message: "Máquina creada", IdMaquina: id });
	} catch (error) {
		console.error("Error al crear máquina:", error);
		res.status(500).json({ message: "Error interno del servidor" });
	}
}

async function listar(req, res) {
	try {
		const maquinas = await model.listarMaquinas();
		res.json(maquinas);
	} catch (error) {
		console.error("Error al listar máquinas:", error);
		res.status(500).json({ message: "Error al obtener máquinas" });
	}
}

module.exports = {
	crear,
	listar,
};
