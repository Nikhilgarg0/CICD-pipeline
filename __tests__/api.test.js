const request = require('supertest');
const app = require('../src/app');

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Root Endpoint', () => {
    test('GET / should serve the frontend dashboard', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Root now serves the HTML frontend
      expect(response.headers['content-type']).toMatch(/html/);
      expect(response.text).toContain('RetailOps');
    });

    test('GET /api/info should return API information', async () => {
      const response = await request(app)
        .get('/api/info')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Product API', () => {
    test('GET /api/products should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/products with category filter', async () => {
      const response = await request(app)
        .get('/api/products?category=Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(product => {
        expect(product.category).toBe('Electronics');
      });
    });

    test('POST /api/products should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 49.99,
        stock: 100,
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.price).toBe(newProduct.price);
    });

    test('POST /api/products should fail with invalid data', async () => {
      const invalidProduct = {
        name: '',
        price: -10,
        stock: 100
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/products/:id should return specific product', async () => {
      const listResponse = await request(app).get('/api/products');
      const firstProduct = listResponse.body.data[0];

      const response = await request(app)
        .get(`/api/products/${firstProduct.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(firstProduct.id);
    });

    test('GET /api/products/:id should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('Order API', () => {
    test('GET /api/orders should return all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/orders should create a new order', async () => {
      const productsResponse = await request(app).get('/api/products');
      const product = productsResponse.body.data[0];

      const newOrder = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [
          {
            productId: product.id,
            quantity: 2
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('orderNumber');
      expect(response.body.data.customerName).toBe(newOrder.customerName);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data).toHaveProperty('totalAmount');
    });

    test('POST /api/orders should fail with invalid email', async () => {
      const invalidOrder = {
        customerName: 'John Doe',
        customerEmail: 'invalid-email',
        items: []
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/orders/stats should return order statistics', async () => {
      const response = await request(app)
        .get('/api/orders/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('ordersByStatus');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});