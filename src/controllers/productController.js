const productService = require('../services/productService');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const filters = {
        category: req.query.category,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice
      };
      const products = productService.getAllProducts(filters);
      res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProductById(req, res) {
    try {
      const product = productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createProduct(req, res) {
    try {
      const product = productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const product = productService.updateProduct(req.params.id, req.body);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      productService.deleteProduct(req.params.id);
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();