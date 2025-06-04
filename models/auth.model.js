const { getConnection, sql } = require("../config/dbConfig");
const bcrypt = require("bcryptjs");

async function createUser({ Nombre, Cargo, Usuario, Password }) {
	const pool = await getConnection();
	const hash = await bcrypt.hash(Password, 10);

	await pool
		.request()
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("Cargo", sql.VarChar(50), Cargo)
		.input("Usuario", sql.VarChar(60), Usuario)
		.input("Hash", sql.VarChar(255), hash).query(`
      INSERT INTO Operador (Nombre, Cargo, Usuario, PasswordHash)
      VALUES (@Nombre, @Cargo, @Usuario, @Hash)
    `);
}

async function findByUsuario(usuario) {
	const pool = await getConnection();
	const res = await pool
		.request()
		.input("Usuario", sql.VarChar(60), usuario)
		.query("SELECT * FROM Operador WHERE Usuario = @Usuario");
	return res.recordset[0];
}

async function findById(id) {
	const pool = await getConnection();
	const res = await pool
		.request()
		.input("IdOperador", sql.Int, id)
		.query("SELECT * FROM Operador WHERE IdOperador = @IdOperador");
	return res.recordset[0];
}

module.exports = { createUser, findByUsuario, findById };
