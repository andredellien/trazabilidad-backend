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
		.input("NumeroMaquina", sql.Int, NumeroMaquina)
		.query(
			`SELECT * FROM ProcesoMaquinaRegistro WHERE IdLote = @IdLote AND NumeroMaquina = @NumeroMaquina`
		);

	if (result.recordset.length === 0) return null;

	const form = result.recordset[0];
	form.VariablesIngresadas = JSON.parse(form.VariablesIngresadas);
	return form;
}

module.exports = {
	registrarFormulario,
	obtenerFormulario,
};
