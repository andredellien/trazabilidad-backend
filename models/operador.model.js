// models/operador.model.js
const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query("SELECT * FROM Operador");
	return result.recordset;
}

async function findById(id) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdOperador", sql.Int, id)
		.query("SELECT * FROM Operador WHERE IdOperador = @IdOperador");
	return result.recordset[0];
}

async function create({ Nombre, Cargo }) {
	const pool = await getConnection();
	const insertResult = await pool
		.request()
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("Cargo", sql.VarChar(50), Cargo || null).query(`
      INSERT INTO Operador (Nombre, Cargo)
      VALUES (@Nombre, @Cargo)
    `);
	return insertResult.rowsAffected[0];
}

async function update(id, { Nombre, Cargo }) {
	const pool = await getConnection();
	const updateResult = await pool
		.request()
		.input("IdOperador", sql.Int, id)
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("Cargo", sql.VarChar(50), Cargo).query(`
      UPDATE Operador
      SET Nombre = @Nombre,
          Cargo = @Cargo
      WHERE IdOperador = @IdOperador
    `);
	return updateResult.rowsAffected[0];
}

async function remove(id) {
	const pool = await getConnection();
	const deleteResult = await pool
		.request()
		.input("IdOperador", sql.Int, id)
		.query("DELETE FROM Operador WHERE IdOperador = @IdOperador");
	return deleteResult.rowsAffected[0];
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
