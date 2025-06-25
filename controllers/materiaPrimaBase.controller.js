const model = require("../models/materiaPrimaBase.model");

async function getAll(req, res) {
    try {
        const data = await model.findAll();
        res.json(data);
    } catch (error) {
        console.error("Error al listar materia prima base:", error);
        res.status(500).json({ message: "Error al listar materia prima base" });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const item = await model.findById(id);
        if (!item) return res.status(404).json({ message: "No encontrado" });
        res.json(item);
    } catch (error) {
        console.error("Error al obtener materia prima base:", error);
        res.status(500).json({ message: "Error al obtener materia prima base" });
    }
}

async function create(req, res) {
    try {
        const { Nombre, Unidad, Cantidad } = req.body;
        if (!Nombre || !Unidad) {
            return res.status(400).json({ message: "Nombre y unidad son requeridos" });
        }
        const id = await model.create({ Nombre, Unidad, Cantidad });
        res.status(201).json({ id, message: "Materia prima base creada" });
    } catch (error) {
        console.error("Error al crear materia prima base:", error);
        res.status(500).json({ message: "Error al crear materia prima base" });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { Nombre, Unidad, Cantidad } = req.body;
        const rows = await model.update(id, { Nombre, Unidad, Cantidad });
        if (rows === 0) return res.status(404).json({ message: "No encontrado" });
        res.json({ message: "Materia prima base actualizada" });
    } catch (error) {
        console.error("Error al actualizar materia prima base:", error);
        res.status(500).json({ message: "Error al actualizar materia prima base" });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const rows = await model.remove(id);
        if (rows === 0) return res.status(404).json({ message: "No encontrado" });
        res.json({ message: "Materia prima base eliminada" });
    } catch (error) {
        console.error("Error al eliminar materia prima base:", error);
        res.status(500).json({ message: "Error al eliminar materia prima base" });
    }
}

module.exports = { getAll, getById, create, update, remove }; 