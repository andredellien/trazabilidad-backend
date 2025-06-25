const variableEstandarModel = require('../models/variableEstandar.model');

async function getAll(req, res) {
    try {
        const variables = await variableEstandarModel.findAll();
        res.json(variables);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener variables estándar' });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const variable = await variableEstandarModel.findById(id);
        if (!variable) {
            return res.status(404).json({ message: 'Variable estándar no encontrada' });
        }
        res.json(variable);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la variable estándar' });
    }
}

async function create(req, res) {
    try {
        const { Nombre, Unidad, Descripcion } = req.body;
        if (!Nombre) {
            return res.status(400).json({ message: 'El nombre es obligatorio' });
        }
        const id = await variableEstandarModel.create({ Nombre, Unidad, Descripcion });
        res.status(201).json({ message: 'Variable estándar creada', id });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la variable estándar' });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { Nombre, Unidad, Descripcion, Activo } = req.body;
        await variableEstandarModel.update(id, { Nombre, Unidad, Descripcion, Activo });
        res.json({ message: 'Variable estándar actualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la variable estándar' });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        await variableEstandarModel.remove(id);
        res.json({ message: 'Variable estándar eliminada (desactivada)' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la variable estándar' });
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
}; 