// models/controlCalidad.model.js
const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query("SELECT * FROM ControlCalidad");
	return result.recordset;
}

async function findById(id) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdControl", sql.Int, id)
		.query("SELECT * FROM ControlCalidad WHERE IdControl = @IdControl");
	return result.recordset[0];
}

async function create({ IdProceso, FechaControl, Resultado, Observaciones }) {
	const pool = await getConnection();
	const insertResult = await pool
		.request()
		.input("IdProceso", sql.Int, IdProceso)
		.input("FechaControl", sql.DateTime, FechaControl)
		.input("Resultado", sql.VarChar(50), Resultado)
		.input("Observaciones", sql.VarChar(255), Observaciones || null).query(`
      INSERT INTO ControlCalidad (IdProceso, FechaControl, Resultado, Observaciones)
      VALUES (@IdProceso, @FechaControl, @Resultado, @Observaciones)
    `);
	return insertResult.rowsAffected[0];
}

async function update(
	id,
	{ IdProceso, FechaControl, Resultado, Observaciones }
) {
	const pool = await getConnection();
	const updateResult = await pool
		.request()
		.input("IdControl", sql.Int, id)
		.input("IdProceso", sql.Int, IdProceso)
		.input("FechaControl", sql.DateTime, FechaControl)
		.input("Resultado", sql.VarChar(50), Resultado)
		.input("Observaciones", sql.VarChar(255), Observaciones).query(`
      UPDATE ControlCalidad
      SET IdProceso = @IdProceso,
          FechaControl = @FechaControl,
          Resultado = @Resultado,
          Observaciones = @Observaciones
      WHERE IdControl = @IdControl
    `);
	return updateResult.rowsAffected[0];
}

async function remove(id) {
	const pool = await getConnection();
	const deleteResult = await pool
		.request()
		.input("IdControl", sql.Int, id)
		.query("DELETE FROM ControlCalidad WHERE IdControl = @IdControl");
	return deleteResult.rowsAffected[0];
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
