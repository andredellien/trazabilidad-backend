// config/dbConfig.js
const sql = require("mssql");

const dbSettings = {
	user: "app_user", // Ajusta a tus valores reales
	password: "Password123!", // Ajusta a tus valores reales
	server: "localhost",
	database: "TrazabilidadDB",
	options: {
		trustServerCertificate: true,
		encrypt: true,
	},
};

async function getConnection() {
	try {
		const pool = await sql.connect(dbSettings);
		return pool;
	} catch (error) {
		console.error("Error de conexión a la base de datos:", error);
		throw error;
	}
}

module.exports = {
	getConnection,
	sql,
};
