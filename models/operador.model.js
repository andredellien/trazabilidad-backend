// models/operador.model.js
const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query(`
		SELECT O.*, 
		STUFF((
			SELECT ', ' + M.Nombre
			FROM OperadorMaquina OM
			JOIN Maquina M ON OM.IdMaquina = M.IdMaquina
			WHERE OM.IdOperador = O.IdOperador
			FOR XML PATH('')
		), 1, 2, '') as MaquinasAsignadas
		FROM Operador O
	`);
	return result.recordset;
}

async function findById(id) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdOperador", sql.Int, id)
		.query(`
			SELECT O.*, 
			STUFF((
				SELECT ', ' + M.Nombre
				FROM OperadorMaquina OM
				JOIN Maquina M ON OM.IdMaquina = M.IdMaquina
				WHERE OM.IdOperador = O.IdOperador
				FOR XML PATH('')
			), 1, 2, '') as MaquinasAsignadas
			FROM Operador O
			WHERE O.IdOperador = @IdOperador
		`);
	return result.recordset[0];
}

async function create({ Nombre, Cargo, maquinaIds }) {
	const pool = await getConnection();
	const transaction = pool.transaction();
	await transaction.begin();

	try {
		const insertResult = await transaction
			.request()
			.input("Nombre", sql.VarChar(100), Nombre)
			.input("Cargo", sql.VarChar(50), Cargo || null)
			.query(`
				INSERT INTO Operador (Nombre, Cargo)
				OUTPUT INSERTED.IdOperador
				VALUES (@Nombre, @Cargo)
			`);

		const operadorId = insertResult.recordset[0].IdOperador;

		// Si se proporcionan máquinas, crear las relaciones
		if (maquinaIds && Array.isArray(maquinaIds)) {
			for (const maquinaId of maquinaIds) {
				await transaction
					.request()
					.input("IdOperador", sql.Int, operadorId)
					.input("IdMaquina", sql.Int, maquinaId)
					.query(`
						INSERT INTO OperadorMaquina (IdOperador, IdMaquina)
						VALUES (@IdOperador, @IdMaquina)
					`);
			}
		}

		await transaction.commit();
		return operadorId;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

async function update(id, { Nombre, Cargo, maquinaIds }) {
	const pool = await getConnection();
	const transaction = pool.transaction();
	await transaction.begin();

	try {
		const updateResult = await transaction
			.request()
			.input("IdOperador", sql.Int, id)
			.input("Nombre", sql.VarChar(100), Nombre)
			.input("Cargo", sql.VarChar(50), Cargo)
			.query(`
				UPDATE Operador
				SET Nombre = @Nombre,
					Cargo = @Cargo
				WHERE IdOperador = @IdOperador
			`);

		// Actualizar las relaciones con las máquinas
		if (maquinaIds !== undefined) {
			// Primero eliminar todas las asignaciones existentes
			await transaction
				.request()
				.input("IdOperador", sql.Int, id)
				.query(`
					DELETE FROM OperadorMaquina
					WHERE IdOperador = @IdOperador
				`);

			// Luego insertar las nuevas asignaciones si se proporcionan
			if (maquinaIds && Array.isArray(maquinaIds)) {
				for (const maquinaId of maquinaIds) {
					await transaction
						.request()
						.input("IdOperador", sql.Int, id)
						.input("IdMaquina", sql.Int, maquinaId)
						.query(`
							INSERT INTO OperadorMaquina (IdOperador, IdMaquina)
							VALUES (@IdOperador, @IdMaquina)
						`);
				}
			}
		}

		await transaction.commit();
		return updateResult.rowsAffected[0];
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

async function remove(id) {
	const pool = await getConnection();
	const transaction = pool.transaction();
	await transaction.begin();

	try {
		// Primero eliminar las relaciones con máquinas
		await transaction
			.request()
			.input("IdOperador", sql.Int, id)
			.query(`
				DELETE FROM OperadorMaquina
				WHERE IdOperador = @IdOperador
			`);

		// Luego eliminar el operador
		const deleteResult = await transaction
			.request()
			.input("IdOperador", sql.Int, id)
			.query(`
				DELETE FROM Operador
				WHERE IdOperador = @IdOperador
			`);

		await transaction.commit();
		return deleteResult.rowsAffected[0];
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

// Nuevas funciones para manejar múltiples máquinas
async function asignarMaquinas(operadorId, maquinaIds) {
	const pool = await getConnection();
	const transaction = pool.transaction();
	await transaction.begin();

	try {
		// Eliminar asignaciones existentes
		await transaction
			.request()
			.input("IdOperador", sql.Int, operadorId)
			.query(`
				DELETE FROM OperadorMaquina
				WHERE IdOperador = @IdOperador
			`);

		// Insertar nuevas asignaciones
		for (const maquinaId of maquinaIds) {
			await transaction
				.request()
				.input("IdOperador", sql.Int, operadorId)
				.input("IdMaquina", sql.Int, maquinaId)
				.query(`
					INSERT INTO OperadorMaquina (IdOperador, IdMaquina)
					VALUES (@IdOperador, @IdMaquina)
				`);
		}

		await transaction.commit();
		return true;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

async function obtenerMaquinasAsignadas(operadorId) {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("IdOperador", sql.Int, operadorId)
		.query(`
			SELECT M.*
			FROM Maquina M
			JOIN OperadorMaquina OM ON M.IdMaquina = OM.IdMaquina
			WHERE OM.IdOperador = @IdOperador
		`);
	return result.recordset;
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
	asignarMaquinas,
	obtenerMaquinasAsignadas
};
