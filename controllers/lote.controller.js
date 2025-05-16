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
		const { Nombre, FechaCreacion, Estado, IdProceso, MateriasPrimas } =
			req.body;

		if (!Nombre || !FechaCreacion) {
			return res.status(400).json({ message: "Faltan datos obligatorios" });
		}

		if (MateriasPrimas && !Array.isArray(MateriasPrimas)) {
			return res
				.status(400)
				.json({ message: "MateriasPrimas debe ser un arreglo" });
		}

		if (Array.isArray(MateriasPrimas)) {
			const isValid = MateriasPrimas.every(
				(mp) => mp.IdMateriaPrima && mp.Cantidad >= 0
			);
			if (!isValid) {
				return res
					.status(400)
					.json({ message: "Estructura de materias primas inválida" });
			}
		}

		const newId = await loteModel.create({
			Nombre,
			FechaCreacion,
			Estado,
			IdProceso,
			MateriasPrimas: MateriasPrimas || [],
		});

		res
			.status(201)
			.json({ message: "Lote creado exitosamente", IdLote: newId });
	} catch (error) {
		console.error("Error al crear el lote:", error);
		res.status(500).json({ message: "Error al crear el lote" });
	}
}

async function update(req, res) {
	const { id } = req.params;
	const { Nombre, FechaCreacion, Estado, IdProceso, MateriasPrimas } = req.body;

	try {
		if (MateriasPrimas && !Array.isArray(MateriasPrimas)) {
			return res
				.status(400)
				.json({ message: "MateriasPrimas debe ser un arreglo" });
		}

		if (Array.isArray(MateriasPrimas)) {
			const isValid = MateriasPrimas.every(
				(mp) => mp.IdMateriaPrima && mp.Cantidad >= 0
			);
			if (!isValid) {
				return res
					.status(400)
					.json({ message: "Estructura de materias primas inválida" });
			}
		}

		const updated = await loteModel.update(id, {
			Nombre,
			FechaCreacion,
			Estado,
			IdProceso,
			MateriasPrimas: MateriasPrimas || [],
		});

		if (!updated) {
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
