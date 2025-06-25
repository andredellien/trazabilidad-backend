const { getConnection, sql } = require("../config/dbConfig");
const logMateriaPrimaModel = require("./logMateriaPrima.model");
const pedidoModel = require("./pedido.model");

async function findAll() {
	const pool = await getConnection();
	const result = await pool.request().query(`
		SELECT
			L.IdLote, L.Nombre, L.FechaCreacion, L.Estado, L.IdProceso, L.IdPedido,
			O.Nombre as NombreCliente,
			MPB.IdMateriaPrimaBase, MPB.Nombre AS NombreMateria,
			LM.Cantidad
		FROM Lote L
		LEFT JOIN Pedido P ON L.IdPedido = P.IdPedido
		LEFT JOIN Operador O ON P.IdCliente = O.IdOperador
		LEFT JOIN LoteMateriaPrimaBase LM ON L.IdLote = LM.IdLote
		LEFT JOIN MateriaPrimaBase MPB ON LM.IdMateriaPrimaBase = MPB.IdMateriaPrimaBase
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
				IdPedido: row.IdPedido,
				NombreCliente: row.NombreCliente,
				MateriasPrimas: [],
			};
		}
		if (row.IdMateriaPrimaBase) {
			lotes[row.IdLote].MateriasPrimas.push({
				IdMateriaPrimaBase: row.IdMateriaPrimaBase,
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
			L.IdLote, L.Nombre, L.FechaCreacion, L.Estado, L.IdProceso, L.IdPedido,
			O.Nombre as NombreCliente,
			MPB.IdMateriaPrimaBase, MPB.Nombre AS NombreMateria,
			LM.Cantidad
		FROM Lote L
		LEFT JOIN Pedido P ON L.IdPedido = P.IdPedido
		LEFT JOIN Operador O ON P.IdCliente = O.IdOperador
		LEFT JOIN LoteMateriaPrimaBase LM ON L.IdLote = LM.IdLote
		LEFT JOIN MateriaPrimaBase MPB ON LM.IdMateriaPrimaBase = MPB.IdMateriaPrimaBase
		WHERE L.IdLote = @IdLote
	`);

	if (result.recordset.length === 0) return null;

	const lote = {
		IdLote: result.recordset[0].IdLote,
		Nombre: result.recordset[0].Nombre,
		FechaCreacion: result.recordset[0].FechaCreacion,
		Estado: result.recordset[0].Estado,
		IdProceso: result.recordset[0].IdProceso,
		IdPedido: result.recordset[0].IdPedido,
		NombreCliente: result.recordset[0].NombreCliente,
		MateriasPrimas: result.recordset
			.filter((r) => r.IdMateriaPrimaBase !== null)
			.map((r) => ({
				IdMateriaPrimaBase: r.IdMateriaPrimaBase,
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
	IdPedido,
	MateriasPrimas,
}) {
	const pool = await getConnection();

	// Validar que el pedido exista
	const pedidoResult = await pool
		.request()
		.input("IdPedido", sql.Int, IdPedido)
		.query("SELECT IdPedido FROM Pedido WHERE IdPedido = @IdPedido");

	if (pedidoResult.recordset.length === 0) {
		throw new Error("El pedido especificado no existe");
	}

	const result = await pool
		.request()
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("FechaCreacion", sql.Date, FechaCreacion)
		.input("Estado", sql.VarChar(50), Estado)
		.input("IdProceso", sql.Int, IdProceso)
		.input("IdPedido", sql.Int, IdPedido)
		.query(`
			INSERT INTO Lote (Nombre, FechaCreacion, Estado, IdProceso, IdPedido)
			OUTPUT INSERTED.IdLote
			VALUES (@Nombre, @FechaCreacion, @Estado, @IdProceso, @IdPedido)
		`);

	const newId = result.recordset[0].IdLote;

	for (let mp of MateriasPrimas || []) {
		await pool
			.request()
			.input("IdLote", sql.Int, newId)
			.input("IdMateriaPrimaBase", sql.Int, mp.IdMateriaPrimaBase)
			.input("Cantidad", sql.Decimal(10, 2), mp.Cantidad)
			.query(`
				INSERT INTO LoteMateriaPrimaBase (IdLote, IdMateriaPrimaBase, Cantidad)
				VALUES (@IdLote, @IdMateriaPrimaBase, @Cantidad)
			`);

		// Descontar de la materia prima base
		await pool
			.request()
			.input("IdMateriaPrimaBase", sql.Int, mp.IdMateriaPrimaBase)
			.input("Cantidad", sql.Decimal(10, 2), mp.Cantidad)
			.query(`
				UPDATE MateriaPrimaBase
				SET Cantidad = Cantidad - @Cantidad
				WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase
			`);

		// Registrar en el log
		await logMateriaPrimaModel.create({
			IdMateriaPrimaBase: mp.IdMateriaPrimaBase,
			TipoMovimiento: 'sustraccion',
			Cantidad: mp.Cantidad,
			Descripcion: `Descuento por creación de lote (ID lote: ${newId})`
		});
	}

	// Cambiar estado del pedido a 'En Proceso'
	await pool.request()
		.input('IdPedido', sql.Int, IdPedido)
		.input('Estado', sql.VarChar(50), 'En Proceso')
		.query('UPDATE Pedido SET Estado = @Estado WHERE IdPedido = @IdPedido');

	return newId;
}

async function update(
	id,
	{ Nombre, FechaCreacion, Estado, IdProceso, IdPedido, MateriasPrimas }
) {
	const pool = await getConnection();

	// Validar que el pedido exista si se proporciona
	if (IdPedido) {
		const pedidoResult = await pool
			.request()
			.input("IdPedido", sql.Int, IdPedido)
			.query("SELECT IdPedido FROM Pedido WHERE IdPedido = @IdPedido");

		if (pedidoResult.recordset.length === 0) {
			throw new Error("El pedido especificado no existe");
		}
	}

	// Revertir cantidades originales
	const prev = await pool
		.request()
		.input("IdLote", sql.Int, id)
		.query(
			`SELECT IdMateriaPrimaBase, Cantidad FROM LoteMateriaPrimaBase WHERE IdLote = @IdLote`
		);

	for (let old of prev.recordset) {
		await pool
			.request()
			.input("IdMateriaPrimaBase", sql.Int, old.IdMateriaPrimaBase)
			.input("Cantidad", sql.Decimal(10, 2), old.Cantidad)
			.query(`
				UPDATE MateriaPrimaBase
				SET Cantidad = Cantidad + @Cantidad
				WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase
			`);
	}

	await pool
		.request()
		.input("IdLote", sql.Int, id)
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("FechaCreacion", sql.Date, FechaCreacion)
		.input("Estado", sql.VarChar(50), Estado)
		.input("IdProceso", sql.Int, IdProceso || null)
		.input("IdPedido", sql.Int, IdPedido)
		.query(`
			UPDATE Lote
			SET Nombre = @Nombre,
				FechaCreacion = @FechaCreacion,
				Estado = @Estado,
				IdProceso = @IdProceso,
				IdPedido = @IdPedido
			WHERE IdLote = @IdLote
		`);

	await pool
		.request()
		.input("IdLote", sql.Int, id)
		.query(`DELETE FROM LoteMateriaPrimaBase WHERE IdLote = @IdLote`);

	for (let mp of MateriasPrimas || []) {
		await pool
			.request()
			.input("IdLote", sql.Int, id)
			.input("IdMateriaPrimaBase", sql.Int, mp.IdMateriaPrimaBase)
			.input("Cantidad", sql.Decimal(10, 2), mp.Cantidad)
			.query(`
				INSERT INTO LoteMateriaPrimaBase (IdLote, IdMateriaPrimaBase, Cantidad)
				VALUES (@IdLote, @IdMateriaPrimaBase, @Cantidad)
			`);

		await pool
			.request()
			.input("IdMateriaPrimaBase", sql.Int, mp.IdMateriaPrimaBase)
			.input("Cantidad", sql.Decimal(10, 2), mp.Cantidad)
			.query(`
				UPDATE MateriaPrimaBase
				SET Cantidad = Cantidad - @Cantidad
				WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase
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

		// 4. Obtener las materias primas base asociadas
		const prev = await transaction
			.request()
			.input("IdLote", sql.Int, id)
			.query(
				`SELECT IdMateriaPrimaBase, Cantidad FROM LoteMateriaPrimaBase WHERE IdLote = @IdLote`
			);

		// 5. Devolver las cantidades a las materias primas base
		for (let old of prev.recordset) {
			await transaction
				.request()
				.input("IdMateriaPrimaBase", sql.Int, old.IdMateriaPrimaBase)
				.input("Cantidad", sql.Decimal(10, 2), old.Cantidad)
				.query(`
					UPDATE MateriaPrimaBase
					SET Cantidad = Cantidad + @Cantidad
					WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase
				`);
		}

		// 6. Eliminar registros relacionados
		await transaction
			.request()
			.input("IdLote", sql.Int, id)
			.query(`DELETE FROM LoteMateriaPrimaBase WHERE IdLote = @IdLote`);

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
