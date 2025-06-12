const { getConnection, sql } = require("../config/dbConfig");

async function registrarFormulario({
	IdLote,
	NumeroMaquina,
	NombreMaquina,
	VariablesIngresadas,
	CumpleEstandar,
}) {
	const pool = await getConnection();

	// Primero obtener el IdProcesoMaquina correspondiente
	const procesoMaquina = await pool
		.request()
		.input("IdLote", sql.Int, IdLote)
		.input("NumeroMaquina", sql.Int, NumeroMaquina)
		.query(`
			SELECT PM.IdProcesoMaquina
			FROM ProcesoMaquina PM
			JOIN Lote L ON L.IdProceso = PM.IdProceso
			WHERE L.IdLote = @IdLote AND PM.Numero = @NumeroMaquina
		`);

	if (procesoMaquina.recordset.length === 0) {
		throw new Error("No se encontró la máquina en el proceso");
	}

	const IdProcesoMaquina = procesoMaquina.recordset[0].IdProcesoMaquina;

	const result = await pool
		.request()
		.input("IdLote", sql.Int, IdLote)
		.input("NumeroMaquina", sql.Int, NumeroMaquina)
		.input("NombreMaquina", sql.VarChar(100), NombreMaquina)
		.input("IdProcesoMaquina", sql.Int, IdProcesoMaquina)
		.input(
			"VariablesIngresadas",
			sql.NVarChar(sql.MAX),
			JSON.stringify(VariablesIngresadas)
		)
		.input("CumpleEstandar", sql.Bit, CumpleEstandar)
		.query(`
			INSERT INTO ProcesoMaquinaRegistro 
			(IdLote, NumeroMaquina, NombreMaquina, IdProcesoMaquina, VariablesIngresadas, CumpleEstandar)
			VALUES (@IdLote, @NumeroMaquina, @NombreMaquina, @IdProcesoMaquina, @VariablesIngresadas, @CumpleEstandar)
		`);

	return result.rowsAffected[0] > 0;
}

async function obtenerFormulario(IdLote, NumeroMaquina) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdLote", sql.Int, IdLote)
		.input("NumeroMaquina", sql.Int, NumeroMaquina)
		.query(`
			SELECT PMR.*, PMV.Nombre as VariableNombre, PMV.ValorMin, PMV.ValorMax
			FROM ProcesoMaquinaRegistro PMR
			JOIN ProcesoMaquina PM ON PMR.IdProcesoMaquina = PM.IdProcesoMaquina
			LEFT JOIN ProcesoMaquinaVariable PMV ON PM.IdProcesoMaquina = PMV.IdProcesoMaquina
			WHERE PMR.IdLote = @IdLote AND PMR.NumeroMaquina = @NumeroMaquina
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

	const result = await pool
		.request()
		.input("IdProceso", sql.Int, IdProceso)
		.query(`
			SELECT 
				PM.IdProcesoMaquina,
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
		if (!mapa.has(row.IdProcesoMaquina)) {
			mapa.set(row.IdProcesoMaquina, {
				IdProcesoMaquina: row.IdProcesoMaquina,
				IdMaquina: row.IdMaquina,
				Numero: row.Numero,
				Nombre: row.Nombre,
				Imagen: row.Imagen,
				Variables: [],
			});
		}

		if (row.NombreVariable) {
			mapa.get(row.IdProcesoMaquina).Variables.push({
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
	obtenerProcesoDeLote,
};
