const model = require("../models/procesoEvaluacion.model");
const {
	obtenerProcesoDeLote,
} = require("../models/procesoTransformacion.model");

async function finalizarProceso(req, res) {
	const { idLote } = req.params;

	try {
		// ✅ 1. Obtener cantidad real de máquinas del proceso asignado al lote
		const proceso = await obtenerProcesoDeLote(parseInt(idLote));
		const cantidadEsperada = proceso.length;

		// ✅ 2. Obtener formularios ya registrados
		const registros = await model.obtenerEvaluacionesDeLote(idLote);
		const cantidadActual = registros.length;

		if (cantidadActual < cantidadEsperada) {
			return res.status(400).json({
				message: `Faltan formularios. Solo hay ${cantidadActual} de ${cantidadEsperada} máquinas.`,
			});
		}

		// ✅ 3. Evaluar si alguna máquina falló
		const fallida = registros.find((r) => r.CumpleEstandar === false);

		const estado = fallida ? "No Certificado" : "Certificado";
		const motivo = fallida
			? `Falló en la máquina ${fallida.NumeroMaquina}: ${fallida.NombreMaquina}`
			: "Todas las máquinas cumplen los valores estándar";

		// ✅ 4. Guardar evaluación final y actualizar estado del lote
		await model.registrarResultadoFinal({
			IdLote: parseInt(idLote),
			EstadoFinal: estado,
			Motivo: motivo,
		});

		res.json({ message: estado, motivo });
	} catch (error) {
		console.error("Error al finalizar proceso:", error);
		res.status(500).json({ message: "Error interno" });
	}
}

const { obtenerLogCompleto } = require("../models/procesoEvaluacion.model");

async function obtenerLog(req, res) {
	const { idLote } = req.params;
	try {
		const log = await obtenerLogCompleto(parseInt(idLote));
		if (!log.ResultadoFinal) {
			return res
				.status(404)
				.json({ message: "El lote aún no ha sido evaluado" });
		}
		res.json(log);
	} catch (error) {
		console.error("Error al obtener log del lote:", error);
		res.status(500).json({ message: "Error interno" });
	}
}

module.exports = {
	finalizarProceso,
	obtenerLog,
};
