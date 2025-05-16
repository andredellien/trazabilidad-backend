const { getConnection, sql } = require("../config/dbConfig");

// Crear proceso completo con máquinas y variables
async function crearProceso({ nombre, maquinas }) {
	const pool = await getConnection();

	// 1. Crear proceso
	const result = await pool
		.request()
		.input("Nombre", sql.VarChar(100), nombre)
		.query(
			`INSERT INTO Proceso (Nombre) OUTPUT INSERTED.IdProceso VALUES (@Nombre)`
		);

	const idProceso = result.recordset[0].IdProceso;

	// 2. Insertar máquinas y variables
	for (let maquina of maquinas) {
		const maquinaResult = await pool
			.request()
			.input("IdProceso", sql.Int, idProceso)
			.input("Numero", sql.Int, maquina.numero)
			.input("Nombre", sql.VarChar(100), maquina.nombre)
			.input("Imagen", sql.VarChar(255), maquina.imagen).query(`
				INSERT INTO ProcesoMaquina (IdProceso, Numero, Nombre, Imagen)
				OUTPUT INSERTED.IdMaquina
				VALUES (@IdProceso, @Numero, @Nombre, @Imagen)
			`);

		const idMaquina = maquinaResult.recordset[0].IdMaquina;

		for (let variable of maquina.variables) {
			await pool
				.request()
				.input("IdMaquina", sql.Int, idMaquina)
				.input("Nombre", sql.VarChar(100), variable.nombre)
				.input("ValorMin", sql.Decimal(10, 2), variable.min)
				.input("ValorMax", sql.Decimal(10, 2), variable.max).query(`
					INSERT INTO MaquinaVariable (IdMaquina, Nombre, ValorMin, ValorMax)
					VALUES (@IdMaquina, @Nombre, @ValorMin, @ValorMax)
				`);
		}
	}

	return idProceso;
}

// Obtener todos los procesos con resumen
async function obtenerProcesos() {
	const pool = await getConnection();
	const result = await pool.request().query(`SELECT * FROM Proceso`);
	return result.recordset;
}

// Obtener proceso completo con máquinas y variables
async function obtenerProcesoPorId(id) {
	const pool = await getConnection();

	// Obtener proceso
	const proceso = await pool
		.request()
		.input("IdProceso", sql.Int, id)
		.query(`SELECT * FROM Proceso WHERE IdProceso = @IdProceso`);

	if (proceso.recordset.length === 0) return null;

	// Obtener máquinas
	const maquinas = await pool
		.request()
		.input("IdProceso", sql.Int, id)
		.query(
			`SELECT * FROM ProcesoMaquina WHERE IdProceso = @IdProceso ORDER BY Numero`
		);

	const detalles = [];

	for (let maquina of maquinas.recordset) {
		const variables = await pool
			.request()
			.input("IdMaquina", sql.Int, maquina.IdMaquina)
			.query(`SELECT * FROM MaquinaVariable WHERE IdMaquina = @IdMaquina`);

		detalles.push({
			...maquina,
			variables: variables.recordset, // 🔁 Incluye las variables aquí
		});
	}

	return {
		IdProceso: proceso.recordset[0].IdProceso,
		Nombre: proceso.recordset[0].Nombre,
		Maquinas: detalles, // ✅ Cada máquina con sus variables
	};
}

async function actualizarProceso(idProceso, { nombre, maquinas }) {
	const pool = await getConnection();

	// 1. Actualizar nombre
	await pool
		.request()
		.input("IdProceso", sql.Int, idProceso)
		.input("Nombre", sql.VarChar(100), nombre).query(`
			UPDATE Proceso SET Nombre = @Nombre WHERE IdProceso = @IdProceso
		`);

	// 2. Eliminar máquinas anteriores
	await pool.request().input("IdProceso", sql.Int, idProceso).query(`
			DELETE FROM MaquinaVariable WHERE IdMaquina IN (
				SELECT IdMaquina FROM ProcesoMaquina WHERE IdProceso = @IdProceso
			);
			DELETE FROM ProcesoMaquina WHERE IdProceso = @IdProceso;
		`);

	// 3. Insertar nuevas máquinas y variables
	for (let maquina of maquinas) {
		const maquinaResult = await pool
			.request()
			.input("IdProceso", sql.Int, idProceso)
			.input("Numero", sql.Int, maquina.numero)
			.input("Nombre", sql.VarChar(100), maquina.nombre)
			.input("Imagen", sql.VarChar(255), maquina.imagen).query(`
				INSERT INTO ProcesoMaquina (IdProceso, Numero, Nombre, Imagen)
				OUTPUT INSERTED.IdMaquina
				VALUES (@IdProceso, @Numero, @Nombre, @Imagen)
			`);

		const idMaquina = maquinaResult.recordset[0].IdMaquina;

		for (let variable of maquina.variables) {
			await pool
				.request()
				.input("IdMaquina", sql.Int, idMaquina)
				.input("Nombre", sql.VarChar(100), variable.nombre)
				.input("ValorMin", sql.Decimal(10, 2), variable.min)
				.input("ValorMax", sql.Decimal(10, 2), variable.max).query(`
					INSERT INTO MaquinaVariable (IdMaquina, Nombre, ValorMin, ValorMax)
					VALUES (@IdMaquina, @Nombre, @ValorMin, @ValorMax)
				`);
		}
	}

	return true;
}

async function eliminarProceso(id) {
	const pool = await getConnection();

	await pool.request().input("IdProceso", sql.Int, id).query(`
			DELETE FROM MaquinaVariable WHERE IdMaquina IN (
				SELECT IdMaquina FROM ProcesoMaquina WHERE IdProceso = @IdProceso
			);
			DELETE FROM ProcesoMaquina WHERE IdProceso = @IdProceso;
			DELETE FROM Proceso WHERE IdProceso = @IdProceso;
		`);
}

module.exports = {
	crearProceso,
	obtenerProcesos,
	obtenerProcesoPorId,
	actualizarProceso,
	eliminarProceso,
};
