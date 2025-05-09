const { getConnection, sql } = require("../config/dbConfig");

async function obtenerEvaluacionesDeLote(idLote) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdLote", sql.Int, idLote)
		.query(`SELECT * FROM ProcesoMaquinaRegistro WHERE IdLote = @IdLote`);
	return result.recordset;
}

async function registrarResultadoFinal({ IdLote, EstadoFinal, Motivo }) {
	const pool = await getConnection();
	await pool
		.request()
		.input("IdLote", sql.Int, IdLote)
		.input("EstadoFinal", sql.VarChar(50), EstadoFinal)
		.input("Motivo", sql.NVarChar(255), Motivo).query(`
      INSERT INTO ProcesoEvaluacionFinal (IdLote, EstadoFinal, Motivo)
      VALUES (@IdLote, @EstadoFinal, @Motivo)
    `);

	await pool
		.request()
		.input("IdLote", sql.Int, IdLote)
		.input("Estado", sql.VarChar(50), EstadoFinal)
		.query(`UPDATE Lote SET Estado = @Estado WHERE IdLote = @IdLote`);
}

async function obtenerLogCompleto(idLote) {
	const pool = await getConnection();

	const registros = await pool.request().input("IdLote", sql.Int, idLote)
		.query(`
      SELECT *
      FROM ProcesoMaquinaRegistro
      WHERE IdLote = @IdLote
      ORDER BY NumeroMaquina
    `);

	const resultadoFinal = await pool.request().input("IdLote", sql.Int, idLote)
		.query(`
      SELECT *
      FROM ProcesoEvaluacionFinal
      WHERE IdLote = @IdLote
    `);

	return {
		Maquinas: registros.recordset.map((r) => ({
			NumeroMaquina: r.NumeroMaquina,
			NombreMaquina: r.NombreMaquina,
			VariablesIngresadas: JSON.parse(r.VariablesIngresadas),
			CumpleEstandar: r.CumpleEstandar,
			FechaRegistro: r.FechaRegistro,
		})),
		ResultadoFinal: resultadoFinal.recordset[0] || null,
	};
}

module.exports = {
	obtenerEvaluacionesDeLote,
	registrarResultadoFinal,
	obtenerLogCompleto,
};
