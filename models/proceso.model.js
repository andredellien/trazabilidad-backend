const { getConnection, sql } = require("../config/dbConfig");

// Crear proceso completo con máquinas y variables
async function crearProceso({ nombre, maquinas }) {
	const pool = await getConnection();
	const transaction = pool.transaction();
	await transaction.begin();

	try {
		// 1. Crear proceso
		const result = await transaction
			.request()
			.input("Nombre", sql.VarChar(100), nombre)
			.query(
				`INSERT INTO Proceso (Nombre) OUTPUT INSERTED.IdProceso VALUES (@Nombre)`
			);

		const idProceso = result.recordset[0].IdProceso;

		// 2. Insertar máquinas y variables
		for (let maquina of maquinas) {
			// Primero verificar si la máquina existe por su nombre
			const maquinaExistente = await transaction
				.request()
				.input("Nombre", sql.VarChar(100), maquina.nombre)
				.query(`
					SELECT IdMaquina, ImagenUrl FROM Maquina WHERE Nombre = @Nombre
				`);

			if (maquinaExistente.recordset.length === 0) {
				throw new Error(`La máquina "${maquina.nombre}" no existe`);
			}

			const idMaquina = maquinaExistente.recordset[0].IdMaquina;
			const imagenUrl = maquinaExistente.recordset[0].ImagenUrl;

			// Insertar la máquina en ProcesoMaquina
			await transaction
				.request()
				.input("IdProceso", sql.Int, idProceso)
				.input("IdMaquina", sql.Int, idMaquina)
				.input("Numero", sql.Int, maquina.numero)
				.input("Nombre", sql.VarChar(100), maquina.nombre)
				.input("Imagen", sql.VarChar(255), imagenUrl)
				.query(`
					INSERT INTO ProcesoMaquina (IdProceso, IdMaquina, Numero, Nombre, Imagen)
					VALUES (@IdProceso, @IdMaquina, @Numero, @Nombre, @Imagen)
				`);

			// Obtener el IdMaquina recién insertado
			const maquinaInsertada = await transaction
				.request()
				.input("IdProceso", sql.Int, idProceso)
				.input("IdMaquina", sql.Int, idMaquina)
				.query(`
					SELECT IdMaquina 
					FROM ProcesoMaquina 
					WHERE IdProceso = @IdProceso AND IdMaquina = @IdMaquina
				`);

			const idProcesoMaquina = maquinaInsertada.recordset[0].IdMaquina;

			// Insertar las variables específicas de este proceso y máquina
			for (let variable of maquina.variables) {
				await transaction
					.request()
					.input("IdMaquina", sql.Int, idProcesoMaquina)
					.input("Nombre", sql.VarChar(100), variable.nombre)
					.input("ValorMin", sql.Decimal(10, 2), variable.min)
					.input("ValorMax", sql.Decimal(10, 2), variable.max)
					.query(`
						INSERT INTO MaquinaVariable (IdMaquina, Nombre, ValorMin, ValorMax)
						VALUES (@IdMaquina, @Nombre, @ValorMin, @ValorMax)
					`);
			}
		}

		await transaction.commit();
		return idProceso;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
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

	// Obtener máquinas con sus variables
	const maquinas = await pool
		.request()
		.input("IdProceso", sql.Int, id)
		.query(`
			SELECT 
				PM.IdProcesoMaquina,
				PM.IdMaquina,
				PM.Numero,
				PM.Nombre,
				M.ImagenUrl,
				PMV.Nombre as VariableNombre,
				PMV.ValorMin,
				PMV.ValorMax
			FROM ProcesoMaquina PM
			JOIN Maquina M ON PM.IdMaquina = M.IdMaquina
			LEFT JOIN ProcesoMaquinaVariable PMV ON PM.IdProcesoMaquina = PMV.IdProcesoMaquina
			WHERE PM.IdProceso = @IdProceso
			ORDER BY PM.Numero
		`);

	// Procesar el resultado para agrupar las variables por máquina
	const maquinasProcesadas = {};
	for (const row of maquinas.recordset) {
		if (!maquinasProcesadas[row.IdMaquina]) {
			maquinasProcesadas[row.IdMaquina] = {
				IdMaquina: row.IdMaquina,
				Numero: row.Numero,
				Nombre: row.Nombre,
				Imagen: row.ImagenUrl,
				variables: []
			};
		}
		
		// Solo agregar la variable si existe
		if (row.VariableNombre && row.ValorMin !== null && row.ValorMax !== null) {
			maquinasProcesadas[row.IdMaquina].variables.push({
				nombre: row.VariableNombre,
				min: parseFloat(row.ValorMin),
				max: parseFloat(row.ValorMax)
			});
		}
	}

	return {
		IdProceso: proceso.recordset[0].IdProceso,
		Nombre: proceso.recordset[0].Nombre,
		Maquinas: Object.values(maquinasProcesadas)
	};
}

async function actualizarProceso(idProceso, { nombre, maquinas }) {
	const pool = await getConnection();
	const transaction = pool.transaction();

	try {
		await transaction.begin();

		// 1. Actualizar nombre
		await transaction
			.request()
			.input("IdProceso", sql.Int, idProceso)
			.input("Nombre", sql.VarChar(100), nombre)
			.query(`
				UPDATE Proceso 
				SET Nombre = @Nombre 
				WHERE IdProceso = @IdProceso
			`);

		// 2. Eliminar máquinas anteriores
		await transaction
			.request()
			.input("IdProceso", sql.Int, idProceso)
			.query(`
				DELETE FROM ProcesoMaquinaVariable 
				WHERE IdProcesoMaquina IN (
					SELECT IdProcesoMaquina 
					FROM ProcesoMaquina 
					WHERE IdProceso = @IdProceso
				);
				DELETE FROM ProcesoMaquina WHERE IdProceso = @IdProceso;
			`);

		// 3. Insertar nuevas máquinas y variables
		for (let maquina of maquinas) {
			// Primero verificar si la máquina existe por su nombre
			const maquinaExistente = await transaction
				.request()
				.input("Nombre", sql.VarChar(100), maquina.nombre)
				.query(`
					SELECT IdMaquina, ImagenUrl FROM Maquina WHERE Nombre = @Nombre
				`);

			if (maquinaExistente.recordset.length === 0) {
				throw new Error(`La máquina "${maquina.nombre}" no existe`);
			}

			const idMaquina = maquinaExistente.recordset[0].IdMaquina;
			const imagenUrl = maquinaExistente.recordset[0].ImagenUrl;

			// Asociar la máquina existente con el proceso
			const result = await transaction
				.request()
				.input("IdProceso", sql.Int, idProceso)
				.input("IdMaquina", sql.Int, idMaquina)
				.input("Numero", sql.Int, maquina.numero)
				.input("Nombre", sql.VarChar(100), maquina.nombre)
				.input("Imagen", sql.VarChar(255), imagenUrl)
				.query(`
					INSERT INTO ProcesoMaquina (IdProceso, IdMaquina, Numero, Nombre, Imagen)
					OUTPUT INSERTED.IdProcesoMaquina
					VALUES (@IdProceso, @IdMaquina, @Numero, @Nombre, @Imagen)
				`);

			const idProcesoMaquina = result.recordset[0].IdProcesoMaquina;

			// Insertar las variables específicas de este proceso y máquina
			for (let variable of maquina.variables) {
				await transaction
					.request()
					.input("IdProcesoMaquina", sql.Int, idProcesoMaquina)
					.input("Nombre", sql.VarChar(100), variable.nombre)
					.input("ValorMin", sql.Decimal(10, 2), variable.min)
					.input("ValorMax", sql.Decimal(10, 2), variable.max)
					.query(`
						INSERT INTO ProcesoMaquinaVariable (IdProcesoMaquina, Nombre, ValorMin, ValorMax)
						VALUES (@IdProcesoMaquina, @Nombre, @ValorMin, @ValorMax)
					`);
			}
		}

		await transaction.commit();
		return true;
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
}

async function eliminarProceso(id) {
	const pool = await getConnection();
	const transaction = pool.transaction();

	try {
		await transaction.begin();

		// 1. Verificar si el proceso existe
		const proceso = await transaction
			.request()
			.input("IdProceso", sql.Int, id)
			.query("SELECT IdProceso FROM Proceso WHERE IdProceso = @IdProceso");

		if (proceso.recordset.length === 0) {
			await transaction.rollback();
			return false;
		}

		// 2. Verificar si hay lotes usando este proceso
		const lotes = await transaction
			.request()
			.input("IdProceso", sql.Int, id)
			.query("SELECT IdLote FROM Lote WHERE IdProceso = @IdProceso");

		if (lotes.recordset.length > 0) {
			await transaction.rollback();
			throw new Error("No se puede eliminar el proceso porque está siendo usado en lotes");
		}

		// 3. Eliminar en orden para respetar las restricciones de clave foránea
		// Primero las variables de las máquinas
		await transaction
			.request()
			.input("IdProceso", sql.Int, id)
			.query(`
				DELETE FROM MaquinaVariable 
				WHERE IdMaquina IN (
					SELECT IdMaquina FROM ProcesoMaquina WHERE IdProceso = @IdProceso
				)
			`);

		// Luego las máquinas del proceso
		await transaction
			.request()
			.input("IdProceso", sql.Int, id)
			.query("DELETE FROM ProcesoMaquina WHERE IdProceso = @IdProceso");

		// Finalmente el proceso
		await transaction
			.request()
			.input("IdProceso", sql.Int, id)
			.query("DELETE FROM Proceso WHERE IdProceso = @IdProceso");

		await transaction.commit();
		return true;
	} catch (error) {
		await transaction.rollback();
		console.error("Error en eliminarProceso:", error);
		throw error;
	}
}

module.exports = {
	crearProceso,
	obtenerProcesos,
	obtenerProcesoPorId,
	actualizarProceso,
	eliminarProceso,
};
