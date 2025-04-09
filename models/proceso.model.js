// models/proceso.model.js
const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query("SELECT * FROM Proceso");
	return result.recordset;
}

async function findById(id) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdProceso", sql.Int, id)
		.query("SELECT * FROM Proceso WHERE IdProceso = @IdProceso");
	return result.recordset[0];
}

async function create({
	IdLote,
	IdOperador,
	NombreProceso,
	FechaInicio,
	FechaFin,
}) {
	const pool = await getConnection();
	const insertResult = await pool
		.request()
		.input("IdLote", sql.Int, IdLote)
		.input("IdOperador", sql.Int, IdOperador)
		.input("NombreProceso", sql.VarChar(100), NombreProceso)
		.input("FechaInicio", sql.DateTime, FechaInicio)
		.input("FechaFin", sql.DateTime, FechaFin || null).query(`
      INSERT INTO Proceso (IdLote, IdOperador, NombreProceso, FechaInicio, FechaFin)
      VALUES (@IdLote, @IdOperador, @NombreProceso, @FechaInicio, @FechaFin)
    `);
	return insertResult.rowsAffected[0];
}

async function update(
	id,
	{ IdLote, IdOperador, NombreProceso, FechaInicio, FechaFin }
) {
	const pool = await getConnection();
	const updateResult = await pool
		.request()
		.input("IdProceso", sql.Int, id)
		.input("IdLote", sql.Int, IdLote)
		.input("IdOperador", sql.Int, IdOperador)
		.input("NombreProceso", sql.VarChar(100), NombreProceso)
		.input("FechaInicio", sql.DateTime, FechaInicio)
		.input("FechaFin", sql.DateTime, FechaFin).query(`
      UPDATE Proceso
      SET IdLote = @IdLote,
          IdOperador = @IdOperador,
          NombreProceso = @NombreProceso,
          FechaInicio = @FechaInicio,
          FechaFin = @FechaFin
      WHERE IdProceso = @IdProceso
    `);
	return updateResult.rowsAffected[0];
}

async function remove(id) {
	const pool = await getConnection();
	const deleteResult = await pool
		.request()
		.input("IdProceso", sql.Int, id)
		.query("DELETE FROM Proceso WHERE IdProceso = @IdProceso");
	return deleteResult.rowsAffected[0];
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
