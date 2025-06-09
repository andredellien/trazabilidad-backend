const model = require("../models/proceso.model");
const { actualizarProceso } = require("../models/proceso.model");

async function crear(req, res) {
	try {
		const { nombre, maquinas } = req.body;

		if (!nombre || !Array.isArray(maquinas)) {
			return res.status(400).json({ message: "Datos incompletos" });
		}

		// Validar que cada máquina tenga los datos necesarios
		for (const maquina of maquinas) {
			if (!maquina.numero || !maquina.nombre || !maquina.imagen || !Array.isArray(maquina.variables)) {
				return res.status(400).json({ 
					message: "Cada máquina debe tener número, nombre, imagen y variables" 
				});
			}

			// Validar que cada variable tenga los datos necesarios
			for (const variable of maquina.variables) {
				if (!variable.nombre || variable.min === undefined || variable.max === undefined) {
					return res.status(400).json({ 
						message: "Cada variable debe tener nombre, min y max" 
					});
				}
			}
		}

		const id = await model.crearProceso({ nombre, maquinas });
		res.status(201).json({ message: "Proceso creado", IdProceso: id });
	} catch (error) {
		console.error("Error al crear proceso:", error);
		// Enviar el mensaje de error específico al cliente
		res.status(500).json({ 
			message: "Error al crear el proceso",
			error: error.message 
		});
	}
}

async function listar(req, res) {
	try {
		const procesos = await model.obtenerProcesos();
		res.json(procesos);
	} catch (error) {
		console.error("Error al listar procesos:", error);
		res.status(500).json({ message: "Error interno" });
	}
}

async function obtenerUno(req, res) {
	try {
		const { id } = req.params;
		const proceso = await model.obtenerProcesoPorId(id);

		if (!proceso)
			return res.status(404).json({ message: "Proceso no encontrado" });

		res.json(proceso);
	} catch (error) {
		console.error("Error al obtener proceso:", error);
		res.status(500).json({ message: "Error interno" });
	}
}

async function actualizar(req, res) {
	const { id } = req.params;
	const { nombre, maquinas } = req.body;

	if (!nombre || !Array.isArray(maquinas)) {
		return res.status(400).json({ message: "Datos incompletos" });
	}

	try {
		await actualizarProceso(parseInt(id), { nombre, maquinas });
		res.json({ message: "Proceso actualizado correctamente" });
	} catch (error) {
		console.error("Error al actualizar proceso:", error);
		res.status(500).json({ message: "Error interno" });
	}
}

async function eliminar(req, res) {
	const { id } = req.params;
	try {
		const eliminado = await model.eliminarProceso(parseInt(id));
		if (!eliminado) {
			return res.status(404).json({ message: "Proceso no encontrado" });
		}
		res.json({ message: "Proceso eliminado correctamente" });
	} catch (error) {
		console.error("Error al eliminar proceso:", error);
		if (error.message === "No se puede eliminar el proceso porque está siendo usado en lotes") {
			res.status(400).json({ 
				message: "No se puede eliminar el proceso porque está siendo utilizado en lotes activos" 
			});
		} else if (error.number === 547) { // Error de restricción de clave foránea
			res.status(400).json({ 
				message: "No se puede eliminar el proceso porque está siendo utilizado en otros registros" 
			});
		} else {
			res.status(500).json({ message: "Error al eliminar el proceso" });
		}
	}
}

module.exports = {
	crear,
	listar,
	obtenerUno,
	actualizar,
	eliminar,
};
