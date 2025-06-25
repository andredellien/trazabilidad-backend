const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');
const verifyToken = require('../middlewares/verifyToken');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all pedidos
router.get('/', pedidoController.getAll);

// Get pedido by id
router.get('/:id', pedidoController.getById);

// Create new pedido
router.post('/', pedidoController.create);

// Update pedido
router.put('/:id', pedidoController.update);

// Delete pedido
router.delete('/:id', pedidoController.remove);

module.exports = router; 