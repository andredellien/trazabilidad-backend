const { getConnection, sql } = require('../config/dbConfig');

async function findAll() {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM VariableEstandar WHERE Activo = 1 ORDER BY Nombre');
    return result.recordset;
}

async function findById(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('IdVariableEstandar', sql.Int, id)
        .query('SELECT * FROM VariableEstandar WHERE IdVariableEstandar = @IdVariableEstandar');
    return result.recordset[0];
}

async function create({ Nombre, Unidad, Descripcion }) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('Nombre', sql.NVarChar(100), Nombre)
        .input('Unidad', sql.NVarChar(50), Unidad)
        .input('Descripcion', sql.NVarChar(255), Descripcion)
        .query(`
            INSERT INTO VariableEstandar (Nombre, Unidad, Descripcion)
            OUTPUT INSERTED.IdVariableEstandar
            VALUES (@Nombre, @Unidad, @Descripcion)
        `);
    return result.recordset[0].IdVariableEstandar;
}

async function update(id, { Nombre, Unidad, Descripcion, Activo }) {
    const pool = await getConnection();
    await pool.request()
        .input('IdVariableEstandar', sql.Int, id)
        .input('Nombre', sql.NVarChar(100), Nombre)
        .input('Unidad', sql.NVarChar(50), Unidad)
        .input('Descripcion', sql.NVarChar(255), Descripcion)
        .input('Activo', sql.Bit, Activo)
        .query(`
            UPDATE VariableEstandar
            SET Nombre = @Nombre, Unidad = @Unidad, Descripcion = @Descripcion, Activo = @Activo
            WHERE IdVariableEstandar = @IdVariableEstandar
        `);
}

async function remove(id) {
    const pool = await getConnection();
    await pool.request()
        .input('IdVariableEstandar', sql.Int, id)
        .query('UPDATE VariableEstandar SET Activo = 0 WHERE IdVariableEstandar = @IdVariableEstandar');
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
}; 