const procesoModel = require("../models/proceso.model");

async function getAll(req, res) {
	try {
		const data = await procesoModel.findAll();
		res.json(data);
	} catch (error) {
		console.error("Error al obtener procesos:", error);
		res.status(500).json({ message: "Error al obtener procesos" });
	}
}

async function getById(req, res) {
	const { id } = req.params;
	try {
		const proceso = await procesoModel.findById(id);
		if (!proceso) {
			return res.status(404).json({ message: "Proceso no encontrado" });
		}
		res.json(proceso);
	} catch (error) {
		console.error("Error al obtener el proceso:", error);
		res.status(500).json({ message: "Error al obtener el proceso" });
	}
}

async function create(req, res) {
	try {
		const { IdLote, IdOperador, NombreProceso, FechaInicio, FechaFin } =
			req.body;
		await procesoModel.create({
			IdLote,
			IdOperador,
			NombreProceso,
			FechaInicio,
			FechaFin,
		});
		res.status(201).json({ message: "Proceso creado exitosamente" });
	} catch (error) {
		console.error("Error al crear el proceso:", error);
		res.status(500).json({ message: "Error al crear el proceso" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { IdLote, IdOperador, NombreProceso, FechaInicio, FechaFin } = req.body;
	try {
		const rowsAffected = await procesoModel.update(id, {
			IdLote,
			IdOperador,
			NombreProceso,
			FechaInicio,
			FechaFin,
		});
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Proceso no encontrado para actualizar" });
		}
		res.json({ message: "Proceso actualizado exitosamente" });
	} catch (error) {
		console.error("Error al actualizar el proceso:", error);
		res.status(500).json({ message: "Error al actualizar el proceso" });
	}
}

async function remove(req, res) {
	const { id } = req.params;
	try {
		const rowsAffected = await procesoModel.remove(id);
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Proceso no encontrado para eliminar" });
		}
		res.json({ message: "Proceso eliminado satisfactoriamente" });
	} catch (error) {
		console.error("Error al eliminar el proceso:", error);
		res.status(500).json({ message: "Error al eliminar el proceso" });
	}
}

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
};
