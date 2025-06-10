// config/dbConfig.js
const sql = require("mssql");
require('dotenv').config();

const dbSettings = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	server: process.env.DB_SERVER,
	database: process.env.DB_NAME,
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
