const { getConnection, sql } = require("../config/dbConfig");
const loteModel = require("./lote.model");

async function findAll() {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT A.*, L.Nombre as NombreLote
        FROM Almacenaje A
        JOIN Lote L ON A.IdLote = L.IdLote
        ORDER BY A.FechaAlmacenaje DESC, A.IdAlmacenaje DESC
    `);
    return result.recordset;
}

async function findByLote(idLote) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("IdLote", sql.Int, idLote)
        .query(`
            SELECT * FROM Almacenaje WHERE IdLote = @IdLote
            ORDER BY FechaAlmacenaje DESC, IdAlmacenaje DESC
        `);
    return result.recordset;
}

async function create({ IdLote, Ubicacion, Condicion }) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("IdLote", sql.Int, IdLote)
        .input("Ubicacion", sql.VarChar(100), Ubicacion)
        .input("Condicion", sql.VarChar(100), Condicion)
        .query(`
            INSERT INTO Almacenaje (IdLote, Ubicacion, Condicion)
            OUTPUT INSERTED.IdAlmacenaje
            VALUES (@IdLote, @Ubicacion, @Condicion)
        `);

		// Obtener el IdPedido del lote
	const lote = await loteModel.findById(IdLote);
	if (lote && lote.IdPedido) {
		await pool.request()
			.input('IdPedido', sql.Int, lote.IdPedido)
			.input('Estado', sql.VarChar(50), 'Almacenado')
			.query('UPDATE Pedido SET Estado = @Estado WHERE IdPedido = @IdPedido');
	}

    return result.recordset[0].IdAlmacenaje;
}

module.exports = { findAll, findByLote, create }; 