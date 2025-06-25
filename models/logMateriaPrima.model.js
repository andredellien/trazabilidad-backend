const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT L.*, B.Nombre AS NombreMateriaPrimaBase, B.Unidad
        FROM LogMateriaPrima L
        JOIN MateriaPrimaBase B ON L.IdMateriaPrimaBase = B.IdMateriaPrimaBase
        ORDER BY L.Fecha DESC, L.IdLog DESC
    `);
    return result.recordset;
}

async function findByMateriaPrimaBase(idMateriaPrimaBase) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("IdMateriaPrimaBase", sql.Int, idMateriaPrimaBase)
        .query(`
            SELECT L.*, B.Nombre AS NombreMateriaPrimaBase, B.Unidad
            FROM LogMateriaPrima L
            JOIN MateriaPrimaBase B ON L.IdMateriaPrimaBase = B.IdMateriaPrimaBase
            WHERE L.IdMateriaPrimaBase = @IdMateriaPrimaBase
            ORDER BY L.Fecha DESC, L.IdLog DESC
        `);
    return result.recordset;
}

async function create({ IdMateriaPrimaBase, TipoMovimiento, Cantidad, Descripcion }) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("IdMateriaPrimaBase", sql.Int, IdMateriaPrimaBase)
        .input("TipoMovimiento", sql.VarChar(20), TipoMovimiento)
        .input("Cantidad", sql.Decimal(10,2), Cantidad)
        .input("Descripcion", sql.NVarChar(255), Descripcion || null)
        .query(`
            INSERT INTO LogMateriaPrima (IdMateriaPrimaBase, TipoMovimiento, Cantidad, Descripcion)
            VALUES (@IdMateriaPrimaBase, @TipoMovimiento, @Cantidad, @Descripcion)
        `);
    return result.rowsAffected[0];
}

module.exports = { findAll, findByMateriaPrimaBase, create }; 