// controllers/materiaPrima.controller.js
const materiaPrimaModel = require("../models/materiaPrima.model");

async function getAll(req, res) {
	try {
		const data = await materiaPrimaModel.findAll();
		return res.json(data); // Devolvemos el array con las materias primas
	} catch (error) {
		console.error("Error al obtener materias primas:", error);
		return res
			.status(500)
			.json({ message: "Error al obtener materias primas" });
	}
}

async function getById(req, res) {
	const { id } = req.params;
	try {
		const materia = await materiaPrimaModel.findById(id);
		if (!materia) {
			return res.status(404).json({ message: "Materia prima no encontrada" });
		}
		return res.json(materia);
	} catch (error) {
		console.error("Error al obtener materia prima:", error);
		return res.status(500).json({ message: "Error al obtener materia prima" });
	}
}

async function create(req, res) {
	try {
		const { Nombre, FechaRecepcion, Proveedor, Cantidad } = req.body;
		await materiaPrimaModel.create({
			Nombre,
			FechaRecepcion,
			Proveedor,
			Cantidad,
		});
		return res
			.status(201)
			.json({ message: "Materia prima creada exitosamente" });
	} catch (error) {
		console.error("Error al crear materia prima:", error);
		return res.status(500).json({ message: "Error al crear materia prima" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { Nombre, FechaRecepcion, Proveedor, Cantidad } = req.body;
	try {
		const rowsAffected = await materiaPrimaModel.update(id, {
			Nombre,
			FechaRecepcion,
			Proveedor,
			Cantidad,
		});

		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Materia prima no encontrada para actualizar" });
		}
		return res.json({ message: "Materia prima actualizada exitosamente" });
	} catch (error) {
		console.error("Error al actualizar materia prima:", error);
		return res
			.status(500)
			.json({ message: "Error al actualizar materia prima" });
	}
}

async function remove(req, res) {
	const { id } = req.params;
	try {
		const rowsAffected = await materiaPrimaModel.remove(id);
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Materia prima no encontrada para eliminar" });
		}
		return res.json({ message: "Materia prima eliminada satisfactoriamente" });
	} catch (error) {
		console.error("Error al eliminar materia prima:", error);
		return res.status(500).json({ message: "Error al eliminar materia prima" });
	}
}

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
};
