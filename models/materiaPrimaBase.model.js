const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM MateriaPrimaBase ORDER BY Nombre");
    return result.recordset;
}

async function findById(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("IdMateriaPrimaBase", sql.Int, id)
        .query("SELECT * FROM MateriaPrimaBase WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase");
    return result.recordset[0];
}

async function create({ Nombre, Unidad, Cantidad }) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("Nombre", sql.VarChar(100), Nombre)
        .input("Unidad", sql.VarChar(10), Unidad)
        .input("Cantidad", sql.Decimal(10,2), Cantidad || 0)
        .query(`
            INSERT INTO MateriaPrimaBase (Nombre, Unidad, Cantidad)
            OUTPUT INSERTED.IdMateriaPrimaBase
            VALUES (@Nombre, @Unidad, @Cantidad)
        `);
    return result.recordset[0].IdMateriaPrimaBase;
}

async function update(id, { Nombre, Unidad, Cantidad }) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("IdMateriaPrimaBase", sql.Int, id)
        .input("Nombre", sql.VarChar(100), Nombre)
        .input("Unidad", sql.VarChar(10), Unidad)
        .input("Cantidad", sql.Decimal(10,2), Cantidad)
        .query(`
            UPDATE MateriaPrimaBase
            SET Nombre = @Nombre, Unidad = @Unidad, Cantidad = @Cantidad
            WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase
        `);
    return result.rowsAffected[0];
}

async function remove(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("IdMateriaPrimaBase", sql.Int, id)
        .query("DELETE FROM MateriaPrimaBase WHERE IdMateriaPrimaBase = @IdMateriaPrimaBase");
    return result.rowsAffected[0];
}

module.exports = { findAll, findById, create, update, remove }; 