const operadorModel = require("../models/operador.model");

async function getAll(req, res) {
	try {
		const data = await operadorModel.findAll();
		res.json(data);
	} catch (error) {
		console.error("Error al obtener operadores:", error);
		res.status(500).json({ message: "Error al obtener operadores" });
	}
}

async function getById(req, res) {
	const { id } = req.params;
	try {
		const operador = await operadorModel.findById(id);
		if (!operador) {
			return res.status(404).json({ message: "Operador no encontrado" });
		}
		res.json(operador);
	} catch (error) {
		console.error("Error al obtener el operador:", error);
		res.status(500).json({ message: "Error al obtener el operador" });
	}
}

async function create(req, res) {
	try {
		const { Nombre, Cargo } = req.body;
		await operadorModel.create({ Nombre, Cargo });
		res.status(201).json({ message: "Operador creado exitosamente" });
	} catch (error) {
		console.error("Error al crear el operador:", error);
		res.status(500).json({ message: "Error al crear el operador" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { Nombre, Cargo } = req.body;
	try {
		const rowsAffected = await operadorModel.update(id, { Nombre, Cargo });
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Operador no encontrado para actualizar" });
		}
		res.json({ message: "Operador actualizado exitosamente" });
	} catch (error) {
		console.error("Error al actualizar el operador:", error);
		res.status(500).json({ message: "Error al actualizar el operador" });
	}
}

async function remove(req, res) {
	const { id } = req.params;
	try {
		const rowsAffected = await operadorModel.remove(id);
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Operador no encontrado para eliminar" });
		}
		res.json({ message: "Operador eliminado satisfactoriamente" });
	} catch (error) {
		console.error("Error al eliminar el operador:", error);
		res.status(500).json({ message: "Error al eliminar el operador" });
	}
}

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
};
