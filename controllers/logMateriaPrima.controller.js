const model = require("../models/logMateriaPrima.model");

async function getAll(req, res) {
    try {
        const data = await model.findAll();
        res.json(data);
    } catch (error) {
        console.error("Error al listar logs de materia prima:", error);
        res.status(500).json({ message: "Error al listar logs de materia prima" });
    }
}

async function getByMateriaPrimaBase(req, res) {
    try {
        const { idMateriaPrimaBase } = req.params;
        const data = await model.findByMateriaPrimaBase(idMateriaPrimaBase);
        res.json(data);
    } catch (error) {
        console.error("Error al obtener logs de materia prima:", error);
        res.status(500).json({ message: "Error al obtener logs de materia prima" });
    }
}

module.exports = { getAll, getByMateriaPrimaBase }; 