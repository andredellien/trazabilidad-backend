// models/materiaPrima.model.js
const { getConnection, sql } = require("../config/dbConfig");
const logMateriaPrimaModel = require("./logMateriaPrima.model");

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

async function create({ 
	Nombre, 
	FechaRecepcion, 
	Proveedor, 
	Cantidad, 
	Unidad, 
	Estado, 
	IdProveedor, 
	IdPedido,
	RecepcionConforme,
	FirmaRecepcion,
	IdMateriaPrimaBase
}) {
	const pool = await getConnection();
	
	// Validar que el proveedor exista si se proporciona IdProveedor
	if (IdProveedor) {
		const proveedorResult = await pool
			.request()
			.input("IdProveedor", sql.Int, IdProveedor)
			.query("SELECT Nombre FROM Proveedor WHERE IdProveedor = @IdProveedor");
		
		if (proveedorResult.recordset.length === 0) {
			throw new Error("El proveedor especificado no existe");
		}
	}

	// Validar que el pedido exista si se proporciona IdPedido
	if (IdPedido) {
		const pedidoResult = await pool
			.request()
			.input("IdPedido", sql.Int, IdPedido)
			.query("SELECT IdPedido FROM Pedido WHERE IdPedido = @IdPedido");
		
		if (pedidoResult.recordset.length === 0) {
			throw new Error("El pedido especificado no existe");
		}
	}

	// Validar que la materia prima base exista si se proporciona IdMateriaPrimaBase
	if (IdMateriaPrimaBase) {
		const baseResult = await pool
			.request()
			.input("IdMateriaPrimaBase", sql.Int, IdMateriaPrimaBase)
			.query("SELECT IdMateriaPrimaBase FROM MateriaPrimaBase WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase");
		if (baseResult.recordset.length === 0) {
			throw new Error("La materia prima base especificada no existe");
		}
	}

	const insertResult = await pool
		.request()
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("FechaRecepcion", sql.Date, FechaRecepcion || new Date())
		.input("Proveedor", sql.VarChar(100), Proveedor)
		.input("Cantidad", sql.Decimal(10, 2), Cantidad)
		.input("Unidad", sql.VarChar(10), Unidad || 'kg')
		.input("Estado", sql.VarChar(50), Estado || 'solicitado')
		.input("IdProveedor", sql.Int, IdProveedor)
		.input("IdPedido", sql.Int, IdPedido)
		.input("RecepcionConforme", sql.Bit, RecepcionConforme)
		.input("FirmaRecepcion", sql.VarChar(255), FirmaRecepcion)
		.input("IdMateriaPrimaBase", sql.Int, IdMateriaPrimaBase)
		.query(`
			INSERT INTO MateriaPrima (
				Nombre, FechaRecepcion, Proveedor, Cantidad, 
				Unidad, Estado, IdProveedor, IdPedido,
				RecepcionConforme, FirmaRecepcion, IdMateriaPrimaBase
			)
			VALUES (
				@Nombre, @FechaRecepcion, @Proveedor, @Cantidad,
				@Unidad, @Estado, @IdProveedor, @IdPedido,
				@RecepcionConforme, @FirmaRecepcion, @IdMateriaPrimaBase
			)
		`);

	// Si la materia prima se crea con estado "solicitado" y tiene un IdPedido,
	// actualizar el estado del pedido a "materia prima solicitada"
	if (IdPedido && (Estado === 'solicitado' || !Estado)) {
		await pool
			.request()
			.input("IdPedido", sql.Int, IdPedido)
			.input("Estado", sql.VarChar(50), "materia prima solicitada")
			.query(`
				UPDATE Pedido
				SET Estado = @Estado
				WHERE IdPedido = @IdPedido
			`);
	}

	return insertResult.rowsAffected[0];
}

async function update(id, { 
	Nombre, 
	FechaRecepcion, 
	Proveedor, 
	Cantidad, 
	Unidad, 
	Estado, 
	IdProveedor, 
	IdPedido,
	RecepcionConforme,
	FirmaRecepcion,
	IdMateriaPrimaBase
}) {
	const pool = await getConnection();

	// Validar que el proveedor exista si se proporciona IdProveedor
	if (IdProveedor) {
		const proveedorResult = await pool
			.request()
			.input("IdProveedor", sql.Int, IdProveedor)
			.query("SELECT Nombre FROM Proveedor WHERE IdProveedor = @IdProveedor");
		
		if (proveedorResult.recordset.length === 0) {
			throw new Error("El proveedor especificado no existe");
		}
	}

	// Validar que el pedido exista si se proporciona IdPedido
	if (IdPedido) {
		const pedidoResult = await pool
			.request()
			.input("IdPedido", sql.Int, IdPedido)
			.query("SELECT IdPedido FROM Pedido WHERE IdPedido = @IdPedido");
		
		if (pedidoResult.recordset.length === 0) {
			throw new Error("El pedido especificado no existe");
		}
	}

	// Validar que la materia prima base exista si se proporciona IdMateriaPrimaBase
	if (IdMateriaPrimaBase) {
		const baseResult = await pool
			.request()
			.input("IdMateriaPrimaBase", sql.Int, IdMateriaPrimaBase)
			.query("SELECT IdMateriaPrimaBase FROM MateriaPrimaBase WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase");
		if (baseResult.recordset.length === 0) {
			throw new Error("La materia prima base especificada no existe");
		}
	}

	// Obtener el estado y RecepcionConforme anterior
	const prev = await pool
		.request()
		.input("IdMateriaPrima", sql.Int, id)
		.query("SELECT Estado, RecepcionConforme, Cantidad, IdMateriaPrimaBase FROM MateriaPrima WHERE IdMateriaPrima = @IdMateriaPrima");
	const prevData = prev.recordset[0];

	// LOG de depuración
	console.log('DEBUG update materia prima:', {
		Estado, RecepcionConforme, prevData, IdMateriaPrimaBase, Cantidad
	});

	const updateResult = await pool
		.request()
		.input("IdMateriaPrima", sql.Int, id)
		.input("Nombre", sql.VarChar(100), Nombre)
		.input("FechaRecepcion", sql.Date, FechaRecepcion)
		.input("Proveedor", sql.VarChar(100), Proveedor)
		.input("Cantidad", sql.Decimal(10, 2), Cantidad)
		.input("Unidad", sql.VarChar(10), Unidad)
		.input("Estado", sql.VarChar(50), Estado)
		.input("IdProveedor", sql.Int, IdProveedor)
		.input("IdPedido", sql.Int, IdPedido)
		.input("RecepcionConforme", sql.Bit, RecepcionConforme)
		.input("FirmaRecepcion", sql.VarChar(sql.MAX), FirmaRecepcion)
		.input("IdMateriaPrimaBase", sql.Int, IdMateriaPrimaBase)
		.query(`
			UPDATE MateriaPrima
			SET Nombre = @Nombre,
				FechaRecepcion = @FechaRecepcion,
				Proveedor = @Proveedor,
				Cantidad = @Cantidad,
				Unidad = @Unidad,
				Estado = @Estado,
				IdProveedor = @IdProveedor,
				IdPedido = @IdPedido,
				RecepcionConforme = @RecepcionConforme,
				FirmaRecepcion = @FirmaRecepcion,
				IdMateriaPrimaBase = @IdMateriaPrimaBase
			WHERE IdMateriaPrima = @IdMateriaPrima
		`);

	// Mejorar la condición para mayor robustez
	if (
		Estado && Estado.toLowerCase() === 'recibida' && (RecepcionConforme === true || RecepcionConforme === 'true') &&
		(!prevData.Estado || prevData.Estado.toLowerCase() !== 'recibida' || prevData.RecepcionConforme !== true)
	) {
		console.log('SUMANDO A BASE', IdMateriaPrimaBase, Cantidad);
		// Sumar a la base
		await pool.request()
			.input("IdMateriaPrimaBase", sql.Int, IdMateriaPrimaBase)
			.input("Cantidad", sql.Decimal(10,2), Cantidad)
			.query(`
				UPDATE MateriaPrimaBase
				SET Cantidad = Cantidad + @Cantidad
				WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase
			`);

		// Registrar en el log
		await logMateriaPrimaModel.create({
			IdMateriaPrimaBase,
			TipoMovimiento: 'adicion',
			Cantidad,
			Descripcion: `Recepción conforme de materia prima (ID solicitud: ${id})`
		});
	}

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
