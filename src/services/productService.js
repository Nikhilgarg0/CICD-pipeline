const Product = require('../models/Product');

class ProductService {
  constructor() {
    // In-memory storage (in production, this would be a database)
    this.products = this.initializeSampleProducts();
  }

  initializeSampleProducts() {
    return [
      new Product('Laptop', 'High-performance laptop for professionals', 1299.99, 50, 'Electronics'),
      new Product('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 200, 'Electronics'),
      new Product('Office Chair', 'Comfortable ergonomic office chair', 249.99, 75, 'Furniture'),
      new Product('Desk Lamp', 'LED desk lamp with adjustable brightness', 39.99, 150, 'Furniture'),
      new Product('Coffee Maker', 'Programmable coffee maker', 79.99, 100, 'Appliances')
    ];
  }

  getAllProducts(filters = {}) {
    let filtered = [...this.products];

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    return filtered;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  createProduct(productData) {
    const errors = Product.validate(productData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const product = new Product(
      productData.name,
      productData.description,
      productData.price,
      productData.stock,
      productData.category
    );

    this.products.push(product);
    return product;
  }

  updateProduct(id, updates) {
    const product = this.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (updates.name) product.name = updates.name;
    if (updates.description) product.description = updates.description;
    if (updates.price !== undefined) product.price = updates.price;
    if (updates.stock !== undefined) product.stock = updates.stock;
    if (updates.category) product.category = updates.category;
    
    product.updatedAt = new Date().toISOString();
    return product;
  }

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    this.products.splice(index, 1);
    return true;
  }

  checkStock(id, quantity) {
    const product = this.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product.stock >= quantity;
  }

  updateStock(id, quantity) {
    const product = this.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    product.updateStock(quantity);
    return product;
  }
}

// Singleton instance
module.exports = new ProductService();