const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query(`
		SELECT
			L.IdLote, L.Nombre, L.FechaCreacion, L.Estado, L.IdProceso,
			M.IdMateriaPrima, M.Nombre AS NombreMateria,
			LM.Cantidad
		FROM Lote L
		LEFT JOIN LoteMateriaPrima LM ON L.IdLote = LM.IdLote
		LEFT JOIN MateriaPrima M ON LM.IdMateriaPrima = M.IdMateriaPrima
		ORDER BY L.IdLote DESC
	`);

	const lotes = {};
	for (const row of result.recordset) {
		if (!lotes[row.IdLote]) {
			lotes[row.IdLote] = {
				IdLote: row.IdLote,
				Nombre: row.Nombre,
				FechaCreacion: row.FechaCreacion,
				Estado: row.Estado,
				IdProceso: row.IdProceso,
				MateriasPrimas: [],
			};
		}
		if (row.IdMateriaPrima) {
			lotes[row.IdLote].MateriasPrimas.push({
				IdMateriaPrima: row.IdMateriaPrima,
				Nombre: row.NombreMateria,
				Cantidad: row.Cantidad,
			});
		}
	}

	return Object.values(lotes);
}

async function findById(id) {
	const pool = await getConnection();
	const result = await pool.request().input("IdLote", sql.Int, id).query(`
		SELECT
			L.IdLote, L.Nombre, L.FechaCreacion, L.Estado, L.IdProceso,
			M.IdMateriaPrima, M.Nombre AS NombreMateria,
			LM.Cantidad
		FROM Lote L
		LEFT JOIN LoteMateriaPrima LM ON L.IdLote = LM.IdLote
		LEFT JOIN MateriaPrima M ON LM.IdMateriaPrima = M.IdMateriaPrima
		WHERE L.IdLote = @IdLote
	`);

	if (result.recordset.length === 0) return null;

	const lote = {
		IdLote: result.recordset[0].IdLote,
		Nombre: result.recordset[0].Nombre,
		FechaCreacion: result.recordset[0].FechaCreacion,
		Estado: result.recordset[0].Estado,
		IdProceso: result.recordset[0].IdProceso,
		MateriasPrimas: result.recordset
			.filter((r) => r.IdMateriaPrima !== null)
			.map((r) => ({
				IdMateriaPrima: r.IdMateriaPrima,
				Nombre: r.NombreMateria,
				Cantidad: r.Cantidad,
			})),
	};

	return lote;
}

async function create({
	Nombre,
	FechaCreacion,
	Estado,
	IdProceso,
	MateriasPrimas,
}) {
	const pool = await getConnection();

	const result = await pool
		.request()
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("FechaCreacion", sql.Date, FechaCreacion)
		.input("Estado", sql.VarChar(50), Estado)
		.input("IdProceso", sql.Int, IdProceso).query(`
			INSERT INTO Lote (Nombre, FechaCreacion, Estado, IdProceso)
			OUTPUT INSERTED.IdLote
			VALUES (@Nombre, @FechaCreacion, @Estado, @IdProceso)
		`);

	const newId = result.recordset[0].IdLote;

	for (let mp of MateriasPrimas || []) {
		await pool
			.request()
			.input("IdLote", sql.Int, newId)
			.input("IdMateriaPrima", sql.Int, mp.IdMateriaPrima)
			.input("Cantidad", sql.Decimal(10, 2), mp.Cantidad).query(`
				INSERT INTO LoteMateriaPrima (IdLote, IdMateriaPrima, Cantidad)
				VALUES (@IdLote, @IdMateriaPrima, @Cantidad)
			`);

		await pool
			.request()
			.input("IdMateriaPrima", sql.Int, mp.IdMateriaPrima)
			.input("Cantidad", sql.Decimal(10, 2), mp.Cantidad).query(`
				UPDATE MateriaPrima
				SET Cantidad = Cantidad - @Cantidad
				WHERE IdMateriaPrima = @IdMateriaPrima
			`);
	}

	return newId;
}

async function update(
	id,
	{ Nombre, FechaCreacion, Estado, IdProceso, MateriasPrimas }
) {
	const pool = await getConnection();

	// Revertir cantidades originales
	const prev = await pool
		.request()
		.input("IdLote", sql.Int, id)
		.query(
			`SELECT IdMateriaPrima, Cantidad FROM LoteMateriaPrima WHERE IdLote = @IdLote`
		);

	for (let old of prev.recordset) {
		await pool
			.request()
			.input("IdMateriaPrima", sql.Int, old.IdMateriaPrima)
			.input("Cantidad", sql.Decimal(10, 2), old.Cantidad).query(`
				UPDATE MateriaPrima
				SET Cantidad = Cantidad + @Cantidad
				WHERE IdMateriaPrima = @IdMateriaPrima
			`);
	}

	await pool
		.request()
		.input("IdLote", sql.Int, id)
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("FechaCreacion", sql.Date, FechaCreacion)
		.input("Estado", sql.VarChar(50), Estado)
		.input("IdProceso", sql.Int, IdProceso || null) // ✅ Aquí permitimos null
		.query(`
			UPDATE Lote
			SET Nombre = @Nombre,
				FechaCreacion = @FechaCreacion,
				Estado = @Estado,
				IdProceso = @IdProceso
			WHERE IdLote = @IdLote
		`);

	await pool
		.request()
		.input("IdLote", sql.Int, id)
		.query(`DELETE FROM LoteMateriaPrima WHERE IdLote = @IdLote`);

	for (let mp of MateriasPrimas || []) {
		await pool
			.request()
			.input("IdLote", sql.Int, id)
			.input("IdMateriaPrima", sql.Int, mp.IdMateriaPrima)
			.input("Cantidad", sql.Decimal(10, 2), mp.Cantidad).query(`
				INSERT INTO LoteMateriaPrima (IdLote, IdMateriaPrima, Cantidad)
				VALUES (@IdLote, @IdMateriaPrima, @Cantidad)
			`);

		await pool
			.request()
			.input("IdMateriaPrima", sql.Int, mp.IdMateriaPrima)
			.input("Cantidad", sql.Decimal(10, 2), mp.Cantidad).query(`
				UPDATE MateriaPrima
				SET Cantidad = Cantidad - @Cantidad
				WHERE IdMateriaPrima = @IdMateriaPrima
			`);
	}

	return true;
}

async function remove(id) {
	const pool = await getConnection();
	const transaction = pool.transaction();

	try {
		// Iniciar la transacción
		await transaction.begin();

		// 1. Verificar si el lote existe
		const lote = await transaction
			.request()
			.input("IdLote", sql.Int, id)
			.query("SELECT Estado FROM Lote WHERE IdLote = @IdLote");

		if (lote.recordset.length === 0) {
			await transaction.rollback();
			throw new Error("El lote no existe");
		}

		// 2. Verificar si el lote está en un estado que permita su eliminación
		const estado = lote.recordset[0].Estado;
		if (estado === "En Proceso" || estado === "Certificado") {
			await transaction.rollback();
			throw new Error("No se puede eliminar un lote que está en proceso o certificado");
		}

		// 3. Verificar si hay registros de transformación
		const transformaciones = await transaction
			.request()
			.input("IdLote", sql.Int, id)
			.query("SELECT COUNT(*) as count FROM ProcesoMaquinaRegistro WHERE IdLote = @IdLote");

		if (transformaciones.recordset[0].count > 0) {
			await transaction.rollback();
			throw new Error("No se puede eliminar un lote que tiene registros de transformación");
		}

		// 4. Obtener las materias primas asociadas
		const prev = await transaction
			.request()
			.input("IdLote", sql.Int, id)
			.query(
				`SELECT IdMateriaPrima, Cantidad FROM LoteMateriaPrima WHERE IdLote = @IdLote`
			);

		// 5. Devolver las cantidades a las materias primas
		for (let old of prev.recordset) {
			await transaction
				.request()
				.input("IdMateriaPrima", sql.Int, old.IdMateriaPrima)
				.input("Cantidad", sql.Decimal(10, 2), old.Cantidad)
				.query(`
					UPDATE MateriaPrima
					SET Cantidad = Cantidad + @Cantidad
					WHERE IdMateriaPrima = @IdMateriaPrima
				`);
		}

		// 6. Eliminar registros relacionados
		await transaction
			.request()
			.input("IdLote", sql.Int, id)
			.query(`DELETE FROM LoteMateriaPrima WHERE IdLote = @IdLote`);

		// 7. Eliminar el lote
		const deleteResult = await transaction
			.request()
			.input("IdLote", sql.Int, id)
			.query(`DELETE FROM Lote WHERE IdLote = @IdLote`);

		if (deleteResult.rowsAffected[0] === 0) {
			await transaction.rollback();
			throw new Error("Error al eliminar el lote");
		}

		// Confirmar la transacción
		await transaction.commit();
		return true;
	} catch (error) {
		// Si hay un error, hacer rollback
		if (transaction._activeRequest) {
			await transaction.rollback();
		}
		throw error;
	}
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
