const path = require("path");
const fs = require("fs");
const model = require("../models/procesoTransformacion.model");
const operadorModel = require("../models/operador.model");

function cargarVariablesEstandar(numeroMaquina) {
	const ruta = path.join(__dirname, "..", "config", "variablesEstandar.json");
	const data = fs.readFileSync(ruta, "utf8");
	const json = JSON.parse(data);
	return json[numeroMaquina];
}

async function registrarFormulario(req, res) {
	const { idLote, numeroMaquina } = req.params;
	const valores = req.body;
	const idOperador = req.user.id; // Obtener el ID del operador del token

	try {
		// Verificar que el operador tenga una máquina asignada
		const operador = await operadorModel.findById(idOperador);
		if (!operador) {
			return res.status(404).json({ message: "Operador no encontrado" });
		}

		// Obtener la lista completa de máquinas del proceso asignado al lote
		const maquinas = await model.obtenerProcesoDeLote(parseInt(idLote));
		const maquina = maquinas.find((m) => m.Numero === parseInt(numeroMaquina));

		if (!maquina) {
			return res
				.status(404)
				.json({ message: "Máquina no encontrada en el proceso asignado" });
		}

		// Verificar que el operador esté asignado a esta máquina usando la tabla OperadorMaquina
		const maquinasAsignadas = await operadorModel.obtenerMaquinasAsignadas(idOperador);
		const tieneAcceso = maquinasAsignadas.some(m => m.IdMaquina === maquina.IdMaquina);

		if (!tieneAcceso) {
			return res.status(403).json({ 
				message: "No tienes permiso para registrar variables de esta máquina" 
			});
		}

		const variablesEstandar = maquina.Variables;
		const nombreMaquina = maquina.Nombre;

		// Validación: comparar valores ingresados con rango min/max
		let cumple = true;
		for (const v of variablesEstandar) {
			const valorIngresado = valores[v.Nombre];
			if (
				valorIngresado === undefined ||
				valorIngresado < v.ValorMin ||
				valorIngresado > v.ValorMax
			) {
				cumple = false;
				break;
			}
		}

		const resultado = await model.registrarFormulario({
			IdLote: parseInt(idLote),
			NumeroMaquina: parseInt(numeroMaquina),
			NombreMaquina: nombreMaquina,
			VariablesIngresadas: valores,
			CumpleEstandar: cumple,
		});

		if (resultado) {
			res.status(201).json({ message: "Formulario guardado", cumple });
		} else {
			res.status(500).json({ message: "Error al guardar" });
		}
	} catch (error) {
		console.error("Error al registrar formulario:", error);
		res.status(500).json({ message: "Error interno" });
	}
}

async function obtenerFormulario(req, res) {
	const { idLote, numeroMaquina } = req.params;
	try {
		const form = await model.obtenerFormulario(
			parseInt(idLote),
			parseInt(numeroMaquina)
		);
		if (!form)
			return res.status(404).json({ message: "Formulario no encontrado" });
		res.json(form);
	} catch (error) {
		console.error("Error al obtener formulario:", error);
		res.status(500).json({ message: "Error interno" });
	}
}

async function obtenerProcesoDeLote(req, res) {
	try {
		const data = await model.obtenerProcesoDeLote(parseInt(req.params.idLote));
		res.json(data);
	} catch (err) {
		console.error("Error al obtener proceso:", err);
		res.status(500).json({ message: "Error interno" });
	}
}

module.exports = {
	registrarFormulario,
	obtenerFormulario,
	obtenerProcesoDeLote,
};
