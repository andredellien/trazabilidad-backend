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
		const { Nombre, Cargo, maquinaIds } = req.body;
		
		// Validar que maquinaIds sea un array si se proporciona
		if (maquinaIds && !Array.isArray(maquinaIds)) {
			return res.status(400).json({ message: "maquinaIds debe ser un array" });
		}

		await operadorModel.create({ Nombre, Cargo, maquinaIds });
		res.status(201).json({ message: "Operador creado exitosamente" });
	} catch (error) {
		console.error("Error al crear el operador:", error);
		res.status(500).json({ message: "Error al crear el operador" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { Nombre, Cargo, maquinaIds } = req.body;

	// Validar que maquinaIds sea un array si se proporciona
	if (maquinaIds && !Array.isArray(maquinaIds)) {
		return res.status(400).json({ message: "maquinaIds debe ser un array" });
	}

	try {
		const rowsAffected = await operadorModel.update(id, { Nombre, Cargo, maquinaIds });
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

// Nuevo endpoint para asignar múltiples máquinas
async function asignarMaquinas(req, res) {
	const { id } = req.params;
	const { maquinaIds } = req.body;

	if (!Array.isArray(maquinaIds)) {
		return res.status(400).json({ message: "maquinaIds debe ser un array" });
	}

	try {
		await operadorModel.asignarMaquinas(id, maquinaIds);
		res.json({ message: "Máquinas asignadas exitosamente" });
	} catch (error) {
		console.error("Error al asignar máquinas:", error);
		res.status(500).json({ message: "Error al asignar máquinas" });
	}
}

// Nuevo endpoint para obtener máquinas asignadas
async function obtenerMaquinasAsignadas(req, res) {
	const { id } = req.params;
	try {
		const maquinas = await operadorModel.obtenerMaquinasAsignadas(id);
		res.json(maquinas);
	} catch (error) {
		console.error("Error al obtener máquinas asignadas:", error);
		res.status(500).json({ message: "Error al obtener máquinas asignadas" });
	}
}

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
	asignarMaquinas,
	obtenerMaquinasAsignadas
};
