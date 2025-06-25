const { getConnection, sql } = require('../config/dbConfig');

async function findAll() {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT p.*, o.Nombre as NombreCliente
        FROM Pedido p
        JOIN Operador o ON p.IdCliente = o.IdOperador
        ORDER BY p.FechaCreacion DESC
    `);
    return result.recordset;
}

async function findById(id) {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input('IdPedido', sql.Int, id)
        .query(`
            SELECT p.*, o.Nombre as NombreCliente
            FROM Pedido p
            JOIN Operador o ON p.IdCliente = o.IdOperador
            WHERE p.IdPedido = @IdPedido
        `);
    return result.recordset[0];
}

async function create({ IdCliente, Observaciones, Descripcion }) {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input('IdCliente', sql.Int, IdCliente)
        .input('Observaciones', sql.NVarChar(sql.MAX), Observaciones)
        .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
        .query(`
            INSERT INTO Pedido (IdCliente, Observaciones, Descripcion)
            OUTPUT INSERTED.IdPedido
            VALUES (@IdCliente, @Observaciones, @Descripcion)
        `);
    return result.recordset[0].IdPedido;
}

async function update(id, { Estado, Observaciones, Descripcion }) {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input('IdPedido', sql.Int, id)
        .input('Estado', sql.VarChar(50), Estado)
        .input('Observaciones', sql.NVarChar(sql.MAX), Observaciones)
        .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
        .query(`
            UPDATE Pedido
            SET Estado = @Estado,
                Observaciones = @Observaciones,
                Descripcion = @Descripcion
            WHERE IdPedido = @IdPedido
        `);
    return result.rowsAffected[0];
}

async function remove(id) {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input('IdPedido', sql.Int, id)
        .query(`
            DELETE FROM Pedido
            WHERE IdPedido = @IdPedido
        `);
    return result.rowsAffected[0];
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
}; 