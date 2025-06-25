const model = require("../models/almacenaje.model");
const loteModel = require("../models/lote.model");

async function getAll(req, res) {
    try {
        const data = await model.findAll();
        res.json(data);
    } catch (error) {
        console.error("Error al listar almacenajes:", error);
        res.status(500).json({ message: "Error al listar almacenajes" });
    }
}

async function getByLote(req, res) {
    try {
        const { idLote } = req.params;
        const data = await model.findByLote(idLote);
        res.json(data);
    } catch (error) {
        console.error("Error al obtener almacenaje por lote:", error);
        res.status(500).json({ message: "Error al obtener almacenaje por lote" });
    }
}

async function create(req, res) {
    try {
        const { IdLote, Ubicacion, Condicion } = req.body;
        if (!IdLote || !Ubicacion || !Condicion) {
            return res.status(400).json({ message: "Datos incompletos" });
        }
        const id = await model.create({ IdLote, Ubicacion, Condicion });

        // Obtener el lote actual para pasar todos los campos requeridos
        const lote = await loteModel.findById(IdLote);
        if (!lote) {
            return res.status(404).json({ message: "Lote no encontrado" });
        }

        await loteModel.update(IdLote, {
            Nombre: lote.Nombre,
            FechaCreacion: lote.FechaCreacion,
            Estado: "almacenado",
            IdProceso: lote.IdProceso,
            IdPedido: lote.IdPedido,
            MateriasPrimas: lote.MateriasPrimas // si tu update lo requiere
        });

        res.status(201).json({ id, message: "Almacenaje registrado y lote actualizado" });
    } catch (error) {
        console.error("Error al crear almacenaje:", error);
        res.status(500).json({ message: "Error al crear almacenaje" });
    }
}

module.exports = { getAll, getByLote, create }; 