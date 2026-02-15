const Product = require('../src/models/Product');

describe('Product Model', () => {
  describe('Product Creation', () => {
    test('should create a product with all fields', () => {
      const product = new Product('Test Product', 'Description', 99.99, 10, 'Electronics');
      
      expect(product).toHaveProperty('id');
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('Description');
      expect(product.price).toBe(99.99);
      expect(product.stock).toBe(10);
      expect(product.category).toBe('Electronics');
      expect(product).toHaveProperty('createdAt');
      expect(product).toHaveProperty('updatedAt');
    });

    test('should generate unique IDs for different products', () => {
      const product1 = new Product('Product 1', 'Desc 1', 10, 5, 'Cat1');
      const product2 = new Product('Product 2', 'Desc 2', 20, 10, 'Cat2');
      
      expect(product1.id).not.toBe(product2.id);
    });
  });

  describe('Product Validation', () => {
    test('should validate a valid product', () => {
      const productData = {
        name: 'Valid Product',
        price: 50,
        stock: 100
      };
      
      const errors = Product.validate(productData);
      expect(errors).toHaveLength(0);
    });

    test('should return error for missing name', () => {
      const productData = {
        name: '',
        price: 50,
        stock: 100
      };
      
      const errors = Product.validate(productData);
      expect(errors).toContain('Product name is required');
    });

    test('should return error for invalid price', () => {
      const productData = {
        name: 'Product',
        price: -10,
        stock: 100
      };
      
      const errors = Product.validate(productData);
      expect(errors).toContain('Price must be a positive number');
    });

    test('should return error for negative stock', () => {
      const productData = {
        name: 'Product',
        price: 50,
        stock: -5
      };
      
      const errors = Product.validate(productData);
      expect(errors).toContain('Stock must be a non-negative number');
    });

    test('should return multiple errors for multiple invalid fields', () => {
      const productData = {
        name: '',
        price: 0,
        stock: -1
      };
      
      const errors = Product.validate(productData);
      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('Stock Management', () => {
    test('should update stock by positive quantity', () => {
      const product = new Product('Product', 'Desc', 50, 10, 'Cat');
      product.updateStock(5);
      
      expect(product.stock).toBe(15);
    });

    test('should update stock by negative quantity', () => {
      const product = new Product('Product', 'Desc', 50, 10, 'Cat');
      product.updateStock(-3);
      
      expect(product.stock).toBe(7);
    });

    test('should throw error when reducing stock below zero', () => {
      const product = new Product('Product', 'Desc', 50, 5, 'Cat');
      
      expect(() => {
        product.updateStock(-10);
      }).toThrow('Insufficient stock');
    });

    test('should update timestamp when stock is updated', (done) => {
      const product = new Product('Product', 'Desc', 50, 10, 'Cat');
      const originalTimestamp = product.updatedAt;
      
      setTimeout(() => {
        product.updateStock(5);
        expect(product.updatedAt).not.toBe(originalTimestamp);
        done();
      }, 10);
    });
  });

  describe('toJSON Method', () => {
    test('should return JSON representation with all fields', () => {
      const product = new Product('Product', 'Description', 99.99, 50, 'Electronics');
      const json = product.toJSON();
      
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', 'Product');
      expect(json).toHaveProperty('description', 'Description');
      expect(json).toHaveProperty('price', 99.99);
      expect(json).toHaveProperty('stock', 50);
      expect(json).toHaveProperty('category', 'Electronics');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });
  });
});