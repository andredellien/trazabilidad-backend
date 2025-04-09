const variableProcesoModel = require("../models/variableProceso.model");

async function getAll(req, res) {
	try {
		const data = await variableProcesoModel.findAll();
		res.json(data);
	} catch (error) {
		console.error("Error al obtener variables de proceso:", error);
		res.status(500).json({ message: "Error al obtener variables de proceso" });
	}
}

async function getById(req, res) {
	const { id } = req.params;
	try {
		const variable = await variableProcesoModel.findById(id);
		if (!variable) {
			return res
				.status(404)
				.json({ message: "Variable de proceso no encontrada" });
		}
		res.json(variable);
	} catch (error) {
		console.error("Error al obtener la variable de proceso:", error);
		res
			.status(500)
			.json({ message: "Error al obtener la variable de proceso" });
	}
}

async function create(req, res) {
	try {
		const { IdProceso, NombreVariable, Valor, Unidad } = req.body;
		await variableProcesoModel.create({
			IdProceso,
			NombreVariable,
			Valor,
			Unidad,
		});
		res
			.status(201)
			.json({ message: "Variable de proceso creada exitosamente" });
	} catch (error) {
		console.error("Error al crear la variable de proceso:", error);
		res.status(500).json({ message: "Error al crear la variable de proceso" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { IdProceso, NombreVariable, Valor, Unidad } = req.body;
	try {
		const rowsAffected = await variableProcesoModel.update(id, {
			IdProceso,
			NombreVariable,
			Valor,
			Unidad,
		});
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Variable de proceso no encontrada para actualizar" });
		}
		res.json({ message: "Variable de proceso actualizada exitosamente" });
	} catch (error) {
		console.error("Error al actualizar la variable de proceso:", error);
		res
			.status(500)
			.json({ message: "Error al actualizar la variable de proceso" });
	}
}

async function remove(req, res) {
	const { id } = req.params;
	try {
		const rowsAffected = await variableProcesoModel.remove(id);
		if (rowsAffected === 0) {
			return res
				.status(404)
				.json({ message: "Variable de proceso no encontrada para eliminar" });
		}
		res.json({ message: "Variable de proceso eliminada satisfactoriamente" });
	} catch (error) {
		console.error("Error al eliminar la variable de proceso:", error);
		res
			.status(500)
			.json({ message: "Error al eliminar la variable de proceso" });
	}
}

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
};
