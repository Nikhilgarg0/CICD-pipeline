const orderService = require('../services/orderService');

class OrderController {
  async getAllOrders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        customerEmail: req.query.customerEmail
      };
      const orders = orderService.getAllOrders(filters);
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const order = orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createOrder(req, res) {
    try {
      const order = orderService.createOrder(req.body);
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }
      const order = orderService.updateOrderStatus(req.params.id, status);
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async cancelOrder(req, res) {
    try {
      const order = orderService.cancelOrder(req.params.id);
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getOrderStats(req, res) {
    try {
      const stats = orderService.getOrderStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new OrderController();