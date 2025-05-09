const path = require("path");
const fs = require("fs");
const model = require("../models/procesoTransformacion.model");

function cargarVariablesEstandar(numeroMaquina) {
	const ruta = path.join(__dirname, "..", "config", "variablesEstandar.json");
	const data = fs.readFileSync(ruta, "utf8");
	const json = JSON.parse(data);
	return json[numeroMaquina];
}

async function registrarFormulario(req, res) {
	const { idLote, numeroMaquina } = req.params;
	const valores = req.body;

	try {
		const estandar = cargarVariablesEstandar(numeroMaquina);
		const variablesEstandar = estandar.variables;
		const nombreMaquina = estandar.nombre;

		// Validación
		let cumple = true;
		for (const [clave, valor] of Object.entries(valores)) {
			const regla = variablesEstandar[clave];
			if (!regla || valor < regla.min || valor > regla.max) {
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

module.exports = {
	registrarFormulario,
	obtenerFormulario,
};
