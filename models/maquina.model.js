const { getConnection, sql } = require("../config/dbConfig");

async function crearMaquina({ nombre, imagenUrl }) {
	const pool = await getConnection();

	const result = await pool
		.request()
		.input("Nombre", sql.VarChar(100), nombre)
		.input("ImagenUrl", sql.VarChar(255), imagenUrl).query(`
			INSERT INTO Maquina (Nombre, ImagenUrl)
			OUTPUT INSERTED.IdMaquina
			VALUES (@Nombre, @ImagenUrl)
		`);

	return result.recordset[0].IdMaquina;
}

async function listarMaquinas() {
	const pool = await getConnection();
	const result = await pool.request().query(`SELECT * FROM Maquina`);
	return result.recordset;
}

module.exports = {
	crearMaquina,
	listarMaquinas,
};
