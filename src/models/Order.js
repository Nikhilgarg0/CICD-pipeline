const { v4: uuidv4 } = require('uuid');

class Order {
  constructor(customerName, customerEmail, items) {
    this.id = uuidv4();
    this.orderNumber = `ORD-${Date.now()}`;
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.items = items;
    this.totalAmount = this.calculateTotal();
    this.status = 'pending';
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  calculateTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  static validate(orderData) {
    const errors = [];

    if (!orderData.customerName || orderData.customerName.trim().length === 0) {
      errors.push('Customer name is required');
    }

    if (!orderData.customerEmail || !orderData.customerEmail.includes('@')) {
      errors.push('Valid customer email is required');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    return errors;
  }

  updateStatus(newStatus) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid order status');
    }
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Order;