const { getConnection, sql } = require("../config/dbConfig");

async function findAll() {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT * FROM Proveedor
        ORDER BY Nombre
    `);
    return result.recordset;
}

async function findById(id) {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("IdProveedor", sql.Int, id)
        .query(`
            SELECT * FROM Proveedor
            WHERE IdProveedor = @IdProveedor
        `);
    return result.recordset[0];
}

async function create({ Nombre, Contacto, Telefono, Email, Direccion }) {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("Nombre", sql.VarChar(100), Nombre)
        .input("Contacto", sql.VarChar(100), Contacto || null)
        .input("Telefono", sql.VarChar(20), Telefono || null)
        .input("Email", sql.VarChar(100), Email || null)
        .input("Direccion", sql.VarChar(255), Direccion || null)
        .query(`
            INSERT INTO Proveedor (Nombre, Contacto, Telefono, Email, Direccion)
            OUTPUT INSERTED.IdProveedor
            VALUES (@Nombre, @Contacto, @Telefono, @Email, @Direccion)
        `);
    return result.recordset[0].IdProveedor;
}

async function update(id, { Nombre, Contacto, Telefono, Email, Direccion }) {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("IdProveedor", sql.Int, id)
        .input("Nombre", sql.VarChar(100), Nombre)
        .input("Contacto", sql.VarChar(100), Contacto || null)
        .input("Telefono", sql.VarChar(20), Telefono || null)
        .input("Email", sql.VarChar(100), Email || null)
        .input("Direccion", sql.VarChar(255), Direccion || null)
        .query(`
            UPDATE Proveedor
            SET Nombre = @Nombre,
                Contacto = @Contacto,
                Telefono = @Telefono,
                Email = @Email,
                Direccion = @Direccion
            WHERE IdProveedor = @IdProveedor
        `);
    return result.rowsAffected[0];
}

async function remove(id) {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("IdProveedor", sql.Int, id)
        .query(`
            DELETE FROM Proveedor
            WHERE IdProveedor = @IdProveedor
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