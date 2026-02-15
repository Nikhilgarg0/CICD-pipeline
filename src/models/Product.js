const { v4: uuidv4 } = require('uuid');

class Product {
  constructor(name, description, price, stock, category) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.category = category;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static validate(productData) {
    const errors = [];

    if (!productData.name || productData.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (typeof productData.price !== 'number' || productData.price <= 0) {
      errors.push('Price must be a positive number');
    }

    if (typeof productData.stock !== 'number' || productData.stock < 0) {
      errors.push('Stock must be a non-negative number');
    }

    return errors;
  }

  updateStock(quantity) {
    if (this.stock + quantity < 0) {
      throw new Error('Insufficient stock');
    }
    this.stock += quantity;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;