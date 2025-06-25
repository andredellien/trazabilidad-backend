const pedidoModel = require('../models/pedido.model');

async function getAll(req, res) {
    try {
        const pedidos = await pedidoModel.findAll();
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ message: 'Error al obtener pedidos' });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const pedido = await pedidoModel.findById(id);
        
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        res.json(pedido);
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ message: 'Error al obtener pedido' });
    }
}

async function create(req, res) {
    try {
        const { IdCliente, Observaciones, Descripcion } = req.body;
        
        if (!IdCliente) {
            return res.status(400).json({ message: 'El ID del cliente es requerido' });
        }

        const pedidoId = await pedidoModel.create({ IdCliente, Observaciones, Descripcion });
        res.status(201).json({ 
            message: 'Pedido creado exitosamente',
            id: pedidoId
        });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ message: 'Error al crear pedido' });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { Estado, Observaciones, Descripcion } = req.body;

        const rowsAffected = await pedidoModel.update(id, { Estado, Observaciones, Descripcion });
        
        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json({ message: 'Pedido actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({ message: 'Error al actualizar pedido' });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const rowsAffected = await pedidoModel.remove(id);
        
        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json({ message: 'Pedido eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        res.status(500).json({ message: 'Error al eliminar pedido' });
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
}; 