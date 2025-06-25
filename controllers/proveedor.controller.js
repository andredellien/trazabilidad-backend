const proveedorModel = require("../models/proveedor.model");

async function getAll(req, res) {
    try {
        const proveedores = await proveedorModel.findAll();
        res.json(proveedores);
    } catch (error) {
        console.error("Error en getAll proveedores:", error);
        res.status(500).json({ message: "Error al obtener proveedores" });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const proveedor = await proveedorModel.findById(id);
        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.json(proveedor);
    } catch (error) {
        console.error("Error en getById proveedor:", error);
        res.status(500).json({ message: "Error al obtener proveedor" });
    }
}

async function create(req, res) {
    try {
        const { Nombre, Contacto, Telefono, Email, Direccion } = req.body;
        if (!Nombre) {
            return res.status(400).json({ message: "El nombre es requerido" });
        }
        const id = await proveedorModel.create({
            Nombre,
            Contacto,
            Telefono,
            Email,
            Direccion
        });
        res.status(201).json({ id, message: "Proveedor creado exitosamente" });
    } catch (error) {
        console.error("Error en create proveedor:", error);
        res.status(500).json({ message: "Error al crear proveedor" });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { Nombre, Contacto, Telefono, Email, Direccion } = req.body;
        if (!Nombre) {
            return res.status(400).json({ message: "El nombre es requerido" });
        }
        const rowsAffected = await proveedorModel.update(id, {
            Nombre,
            Contacto,
            Telefono,
            Email,
            Direccion
        });
        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.json({ message: "Proveedor actualizado exitosamente" });
    } catch (error) {
        console.error("Error en update proveedor:", error);
        res.status(500).json({ message: "Error al actualizar proveedor" });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const rowsAffected = await proveedorModel.remove(id);
        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.json({ message: "Proveedor eliminado exitosamente" });
    } catch (error) {
        console.error("Error en remove proveedor:", error);
        res.status(500).json({ message: "Error al eliminar proveedor" });
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
}; 