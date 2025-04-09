const controlCalidadModel = require("../models/controlCalidad.model");

async function getAll(req, res) {
	try {
		const data = await controlCalidadModel.findAll();
		res.json(data);
	} catch (error) {
		console.error("Error al obtener controles de calidad:", error);
		res.status(500).json({ message: "Error al obtener controles de calidad" });
	}
}

async function getById(req, res) {
	const { id } = req.params;
	try {
		const control = await controlCalidadModel.findById(id);
		if (!control) {
			return res
				.status(404)
				.json({ message: "Control de calidad no encontrado" });
		}
		res.json(control);
	} catch (error) {
		console.error("Error al obtener el control de calidad:", error);
		res.status(500).json({ message: "Error al obtener el control de calidad" });
	}
}

async function create(req, res) {
	try {
		const { IdProceso, FechaControl, Resultado, Observaciones } = req.body;
		await controlCalidadModel.create({
			IdProceso,
			FechaControl,
			Resultado,
			Observaciones,
		});
		res.status(201).json({ message: "Control de calidad creado exitosamente" });
	} catch (error) {
		console.error("Error al crear control de calidad:", error);
		res.status(500).json({ message: "Error al crear control de calidad" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { IdProceso, FechaControl, Resultado, Observaciones } = req.body;
	try {
		const rowsAffected = await controlCalidadModel.update(id, {
			IdProceso,
			FechaControl,
			Resultado,
			Observaciones,
		});
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Control de calidad no encontrado para actualizar" });
		}
		res.json({ message: "Control de calidad actualizado exitosamente" });
	} catch (error) {
		console.error("Error al actualizar control de calidad:", error);
		res.status(500).json({ message: "Error al actualizar control de calidad" });
	}
}

async function remove(req, res) {
	const { id } = req.params;
	try {
		const rowsAffected = await controlCalidadModel.remove(id);
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Control de calidad no encontrado para eliminar" });
		}
		res.json({ message: "Control de calidad eliminado satisfactoriamente" });
	} catch (error) {
		console.error("Error al eliminar control de calidad:", error);
		res.status(500).json({ message: "Error al eliminar control de calidad" });
	}
}

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
};
