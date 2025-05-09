const model = require("../models/procesoEvaluacion.model");

async function finalizarProceso(req, res) {
	const { idLote } = req.params;

	try {
		const registros = await model.obtenerEvaluacionesDeLote(idLote);

		if (registros.length < 12) {
			return res.status(400).json({
				message: `Faltan formularios. Solo hay ${registros.length} de 12 máquinas.`,
			});
		}

		const fallida = registros.find((r) => r.CumpleEstandar === false);

		const estado = fallida ? "No Certificado" : "Certificado";
		const motivo = fallida
			? `Falló en la máquina ${fallida.NumeroMaquina}: ${fallida.NombreMaquina}`
			: "Todas las máquinas cumplen los valores estándar";

		await model.registrarResultadoFinal({
			IdLote: parseInt(idLote),
			EstadoFinal: estado,
			Motivo: motivo,
		});

		res.json({ message: `Proceso finalizado: ${estado}`, motivo });
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
