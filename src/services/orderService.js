const Order = require('../models/Order');
const productService = require('./productService');

class OrderService {
  constructor() {
    this.orders = [];
  }

  getAllOrders(filters = {}) {
    let filtered = [...this.orders];

    if (filters.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    if (filters.customerEmail) {
      filtered = filtered.filter(o => 
        o.customerEmail.toLowerCase().includes(filters.customerEmail.toLowerCase())
      );
    }

    return filtered;
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id);
  }

  createOrder(orderData) {
    const errors = Order.validate(orderData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Check stock availability and build items with current prices
    const items = orderData.items.map(item => {
      const product = productService.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!productService.checkStock(item.productId, item.quantity)) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price
      };
    });

    const order = new Order(
      orderData.customerName,
      orderData.customerEmail,
      items
    );

    // Deduct stock
    items.forEach(item => {
      productService.updateStock(item.productId, -item.quantity);
    });

    this.orders.push(order);
    return order;
  }

  updateOrderStatus(id, status) {
    const order = this.getOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    order.updateStatus(status);
    return order;
  }

  cancelOrder(id) {
    const order = this.getOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'completed') {
      throw new Error('Cannot cancel completed order');
    }

    // Restore stock
    order.items.forEach(item => {
      productService.updateStock(item.productId, item.quantity);
    });

    order.updateStatus('cancelled');
    return order;
  }

  getOrderStats() {
    const stats = {
      totalOrders: this.orders.length,
      totalRevenue: this.orders.reduce((sum, order) => 
        order.status !== 'cancelled' ? sum + order.totalAmount : sum, 0
      ),
      ordersByStatus: {}
    };

    ['pending', 'processing', 'completed', 'cancelled'].forEach(status => {
      stats.ordersByStatus[status] = this.orders.filter(o => o.status === status).length;
    });

    return stats;
  }
}

// Singleton instance
module.exports = new OrderService();