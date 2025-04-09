// models/lote.model.js
const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query("SELECT * FROM Lote");
	return result.recordset;
}

async function findById(id) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdLote", sql.Int, id)
		.query("SELECT * FROM Lote WHERE IdLote = @IdLote");
	return result.recordset[0];
}

async function create({ IdMateriaPrima, FechaCreacion, Estado }) {
	const pool = await getConnection();
	const insertResult = await pool
		.request()
		.input("IdMateriaPrima", sql.Int, IdMateriaPrima)
		.input("FechaCreacion", sql.Date, FechaCreacion)
		.input("Estado", sql.VarChar(50), Estado || null).query(`
      INSERT INTO Lote (IdMateriaPrima, FechaCreacion, Estado)
      VALUES (@IdMateriaPrima, @FechaCreacion, @Estado)
    `);
	return insertResult.rowsAffected[0];
}

async function update(id, { IdMateriaPrima, FechaCreacion, Estado }) {
	const pool = await getConnection();
	const updateResult = await pool
		.request()
		.input("IdLote", sql.Int, id)
		.input("IdMateriaPrima", sql.Int, IdMateriaPrima)
		.input("FechaCreacion", sql.Date, FechaCreacion)
		.input("Estado", sql.VarChar(50), Estado).query(`
      UPDATE Lote
      SET IdMateriaPrima = @IdMateriaPrima,
          FechaCreacion = @FechaCreacion,
          Estado = @Estado
      WHERE IdLote = @IdLote
    `);
	return updateResult.rowsAffected[0];
}

async function remove(id) {
	const pool = await getConnection();
	const deleteResult = await pool
		.request()
		.input("IdLote", sql.Int, id)
		.query("DELETE FROM Lote WHERE IdLote = @IdLote");
	return deleteResult.rowsAffected[0];
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
