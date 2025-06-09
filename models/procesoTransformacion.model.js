const { getConnection, sql } = require("../config/dbConfig");

async function registrarFormulario({
	IdLote,
	NumeroMaquina,
	NombreMaquina,
	VariablesIngresadas,
	CumpleEstandar,
}) {
	const pool = await getConnection();

	const result = await pool
		.request()
		.input("IdLote", sql.Int, IdLote)
		.input("NumeroMaquina", sql.Int, NumeroMaquina)
		.input("NombreMaquina", sql.VarChar(100), NombreMaquina)
		.input(
			"VariablesIngresadas",
			sql.NVarChar(sql.MAX),
			JSON.stringify(VariablesIngresadas)
		)
		.input("CumpleEstandar", sql.Bit, CumpleEstandar).query(`
			INSERT INTO ProcesoMaquinaRegistro 
			(IdLote, NumeroMaquina, NombreMaquina, VariablesIngresadas, CumpleEstandar)
			VALUES (@IdLote, @NumeroMaquina, @NombreMaquina, @VariablesIngresadas, @CumpleEstandar)
		`);

	return result.rowsAffected[0] > 0;
}

async function obtenerFormulario(IdLote, NumeroMaquina) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdLote", sql.Int, IdLote)
		.input("NumeroMaquina", sql.Int, NumeroMaquina).query(`
			SELECT * FROM ProcesoMaquinaRegistro 
			WHERE IdLote = @IdLote AND NumeroMaquina = @NumeroMaquina
		`);

	if (result.recordset.length === 0) return null;

	const form = result.recordset[0];
	form.VariablesIngresadas = JSON.parse(form.VariablesIngresadas);
	return form;
}

async function obtenerProcesoDeLote(idLote) {
	const pool = await getConnection();

	const procesoIdRes = await pool
		.request()
		.input("IdLote", sql.Int, idLote)
		.query(`SELECT IdProceso FROM Lote WHERE IdLote = @IdLote`);

	const IdProceso = procesoIdRes.recordset[0]?.IdProceso;
	if (!IdProceso) return [];

	const result = await pool.request().input("IdProceso", sql.Int, IdProceso)
		.query(`
			SELECT 
				PM.IdMaquina,
				PM.Numero,
				PM.Nombre,
				PM.Imagen,
				PMV.Nombre AS NombreVariable,
				PMV.ValorMin,
				PMV.ValorMax
			FROM ProcesoMaquina PM
			LEFT JOIN ProcesoMaquinaVariable PMV ON PMV.IdProcesoMaquina = PM.IdProcesoMaquina
			WHERE PM.IdProceso = @IdProceso
			ORDER BY PM.Numero
		`);

	const mapa = new Map();
	for (let row of result.recordset) {
		if (!mapa.has(row.IdMaquina)) {
			mapa.set(row.IdMaquina, {
				IdMaquina: row.IdMaquina,
				Numero: row.Numero,
				Nombre: row.Nombre,
				Imagen: row.Imagen,
				Variables: [],
			});
		}

		if (row.NombreVariable) {
			mapa.get(row.IdMaquina).Variables.push({
				Nombre: row.NombreVariable,
				ValorMin: row.ValorMin,
				ValorMax: row.ValorMax,
			});
		}
	}

	return Array.from(mapa.values());
}

module.exports = {
	registrarFormulario,
	obtenerFormulario,
	obtenerProcesoDeLote, // ✅ exporta la nueva función
};
