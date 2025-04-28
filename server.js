// server.js
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;

// Importar las rutas
const materiaPrimaRoutes = require("./routes/materiaPrima.routes");
const loteRoutes = require("./routes/lote.routes");
const operadorRoutes = require("./routes/operador.routes");
const procesoRoutes = require("./routes/proceso.routes");
const variableProcesoRoutes = require("./routes/variableProceso.routes");
const controlCalidadRoutes = require("./routes/controlCalidad.routes");
const authRoutes = require("./routes/auth.routes");
const verifyToken = require("./middlewares/verifyToken");

// Activar CORS en toda la aplicación
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());

// Asignar cada grupo de rutas a su prefijo
app.use("/api/materia-prima", materiaPrimaRoutes);
app.use("/api/lote", loteRoutes);
app.use("/api/operador", operadorRoutes);
app.use("/api/proceso", procesoRoutes);
app.use("/api/variable-proceso", variableProcesoRoutes);
app.use("/api/control-calidad", controlCalidadRoutes);
app.use("/api/auth", authRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
