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
		const { Nombre, FechaCreacion, Estado, IdProceso, IdPedido, MateriasPrimas } = req.body;

		// Solo Nombre y FechaCreacion son obligatorios
		if (!Nombre || !FechaCreacion) {
			return res.status(400).json({ message: "Faltan datos obligatorios" });
		}

		if (MateriasPrimas && !Array.isArray(MateriasPrimas)) {
			return res.status(400).json({ message: "MateriasPrimas debe ser un arreglo" });
		}

		if (Array.isArray(MateriasPrimas)) {
			const isValid = MateriasPrimas.every(
				(mp) => mp.IdMateriaPrimaBase && mp.Cantidad >= 0
			);
			if (!isValid) {
				return res.status(400).json({ message: "Estructura de materias primas inválida" });
			}
		}

		const newId = await loteModel.create({
			Nombre,
			FechaCreacion,
			Estado,
			IdProceso,
			IdPedido,
			MateriasPrimas: MateriasPrimas || [],
		});

		res.status(201).json({ message: "Lote creado exitosamente", IdLote: newId });
	} catch (error) {
		console.error("Error al crear el lote:", error);
		if (error.message.includes("no existe")) {
			return res.status(400).json({ message: error.message });
		}
		res.status(500).json({ message: "Error al crear el lote" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { Nombre, FechaCreacion, Estado, IdProceso, IdPedido, MateriasPrimas } = req.body;

	// Solo Nombre y FechaCreacion son obligatorios
	if (!Nombre || !FechaCreacion) {
		return res.status(400).json({ message: "Faltan datos obligatorios" });
	}

	if (MateriasPrimas && !Array.isArray(MateriasPrimas)) {
		return res.status(400).json({ message: "MateriasPrimas debe ser un arreglo" });
	}

	if (Array.isArray(MateriasPrimas)) {
		const isValid = MateriasPrimas.every(
			(mp) => mp.IdMateriaPrimaBase && mp.Cantidad >= 0
		);
		if (!isValid) {
			return res.status(400).json({ message: "Estructura de materias primas inválida" });
		}
	}

	try {
		const updated = await loteModel.update(id, {
			Nombre,
			FechaCreacion,
			Estado,
			IdProceso,
			IdPedido,
			MateriasPrimas: MateriasPrimas || [],
		});

		if (!updated) {
			return res.status(404).json({ message: "Lote no encontrado para actualizar" });
		}

		res.json({ message: "Lote actualizado exitosamente" });
	} catch (error) {
		console.error("Error al actualizar el lote:", error);
		if (error.message.includes("no existe")) {
			return res.status(400).json({ message: error.message });
		}
		res.status(500).json({ message: "Error al actualizar el lote" });
	}
}

async function remove(req, res) {
	const { id } = req.params;
	try {
		await loteModel.remove(id);
		res.json({ message: "Lote eliminado satisfactoriamente" });
	} catch (error) {
		console.error("Error al eliminar el lote:", error);
		
		// Manejar diferentes tipos de errores
		if (error.message === "El lote no existe") {
			return res.status(404).json({ message: error.message });
		}
		
		if (error.message.includes("No se puede eliminar un lote")) {
			return res.status(400).json({ message: error.message });
		}

		// Para otros errores
		res.status(500).json({ 
			message: "Error al eliminar el lote",
			error: error.message 
		});
	}
}

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove,
};
