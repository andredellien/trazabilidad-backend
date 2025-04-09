const loteModel = require("../models/lote.model");

async function getAll(req, res) {
	try {
		const data = await loteModel.findAll();
		res.json(data);
	} catch (error) {
		console.error("Error al obtener lotes:", error);
		res.status(500).json({ message: "Error al obtener lotes" });
	}
}

async function getById(req, res) {
	const { id } = req.params;
	try {
		const lote = await loteModel.findById(id);
		if (!lote) {
			return res.status(404).json({ message: "Lote no encontrado" });
		}
		res.json(lote);
	} catch (error) {
		console.error("Error al obtener el lote:", error);
		res.status(500).json({ message: "Error al obtener el lote" });
	}
}

async function create(req, res) {
	try {
		const { IdMateriaPrima, FechaCreacion, Estado } = req.body;
		await loteModel.create({ IdMateriaPrima, FechaCreacion, Estado });
		res.status(201).json({ message: "Lote creado exitosamente" });
	} catch (error) {
		console.error("Error al crear el lote:", error);
		res.status(500).json({ message: "Error al crear el lote" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { IdMateriaPrima, FechaCreacion, Estado } = req.body;
	try {
		const rowsAffected = await loteModel.update(id, {
			IdMateriaPrima,
			FechaCreacion,
			Estado,
		});
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Lote no encontrado para actualizar" });
		}
		res.json({ message: "Lote actualizado exitosamente" });
	} catch (error) {
		console.error("Error al actualizar el lote:", error);
		res.status(500).json({ message: "Error al actualizar el lote" });
	}
}

async function remove(req, res) {
	const { id } = req.params;
	try {
		const rowsAffected = await loteModel.remove(id);
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Lote no encontrado para eliminar" });
		}
		res.json({ message: "Lote eliminado satisfactoriamente" });
	} catch (error) {
		console.error("Error al eliminar el lote:", error);
		res.status(500).json({ message: "Error al eliminar el lote" });
	}
}

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
};
