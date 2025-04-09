// models/variableProceso.model.js
const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query("SELECT * FROM VariableProceso");
	return result.recordset;
}

async function findById(id) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdVariable", sql.Int, id)
		.query("SELECT * FROM VariableProceso WHERE IdVariable = @IdVariable");
	return result.recordset[0];
}

async function create({ IdProceso, NombreVariable, Valor, Unidad }) {
	const pool = await getConnection();
	const insertResult = await pool
		.request()
		.input("IdProceso", sql.Int, IdProceso)
		.input("NombreVariable", sql.VarChar(50), NombreVariable)
		.input("Valor", sql.VarChar(50), Valor)
		.input("Unidad", sql.VarChar(20), Unidad || null).query(`
      INSERT INTO VariableProceso (IdProceso, NombreVariable, Valor, Unidad)
      VALUES (@IdProceso, @NombreVariable, @Valor, @Unidad)
    `);
	return insertResult.rowsAffected[0];
}

async function update(id, { IdProceso, NombreVariable, Valor, Unidad }) {
	const pool = await getConnection();
	const updateResult = await pool
		.request()
		.input("IdVariable", sql.Int, id)
		.input("IdProceso", sql.Int, IdProceso)
		.input("NombreVariable", sql.VarChar(50), NombreVariable)
		.input("Valor", sql.VarChar(50), Valor)
		.input("Unidad", sql.VarChar(20), Unidad).query(`
      UPDATE VariableProceso
      SET IdProceso = @IdProceso,
          NombreVariable = @NombreVariable,
          Valor = @Valor,
          Unidad = @Unidad
      WHERE IdVariable = @IdVariable
    `);
	return updateResult.rowsAffected[0];
}

async function remove(id) {
	const pool = await getConnection();
	const deleteResult = await pool
		.request()
		.input("IdVariable", sql.Int, id)
		.query("DELETE FROM VariableProceso WHERE IdVariable = @IdVariable");
	return deleteResult.rowsAffected[0];
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
