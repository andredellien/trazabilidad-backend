// models/materiaPrima.model.js
const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query("SELECT * FROM MateriaPrima");
	return result.recordset;
}

async function findById(id) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdMateriaPrima", sql.Int, id)
		.query("SELECT * FROM MateriaPrima WHERE IdMateriaPrima = @IdMateriaPrima");
	return result.recordset[0];
}

async function create({ Nombre, FechaRecepcion, Proveedor, Cantidad }) {
	const pool = await getConnection();
	const insertResult = await pool
		.request()
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("FechaRecepcion", sql.Date, FechaRecepcion)
		.input("Proveedor", sql.VarChar(100), Proveedor || null)
		.input("Cantidad", sql.Decimal(10, 2), Cantidad || 0).query(`
      INSERT INTO MateriaPrima (Nombre, FechaRecepcion, Proveedor, Cantidad)
      VALUES (@Nombre, @FechaRecepcion, @Proveedor, @Cantidad)
    `);

	return insertResult.rowsAffected[0]; // 1 si se insertó, 0 si no
}

async function update(id, { Nombre, FechaRecepcion, Proveedor, Cantidad }) {
	const pool = await getConnection();
	const updateResult = await pool
		.request()
		.input("IdMateriaPrima", sql.Int, id)
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("FechaRecepcion", sql.Date, FechaRecepcion)
		.input("Proveedor", sql.VarChar(100), Proveedor)
		.input("Cantidad", sql.Decimal(10, 2), Cantidad).query(`
      UPDATE MateriaPrima
      SET Nombre = @Nombre,
          FechaRecepcion = @FechaRecepcion,
          Proveedor = @Proveedor,
          Cantidad = @Cantidad
      WHERE IdMateriaPrima = @IdMateriaPrima
    `);

	return updateResult.rowsAffected[0];
}

async function remove(id) {
	const pool = await getConnection();
	const deleteResult = await pool
		.request()
		.input("IdMateriaPrima", sql.Int, id)
		.query("DELETE FROM MateriaPrima WHERE IdMateriaPrima = @IdMateriaPrima");

	return deleteResult.rowsAffected[0];
}

// Exportamos las funciones para que el controlador las use
module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
