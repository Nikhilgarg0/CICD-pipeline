# Retail App - Node.js API with CI/CD

A professional Node.js retail application with complete CI/CD pipeline using GitHub Actions, Docker, and Kubernetes.

## 🚀 Features

- **RESTful API** for product and order management
- **Automated Testing** with Jest
- **CI/CD Pipeline** with GitHub Actions
- **Containerization** with Docker
- **Kubernetes Deployment** ready
- **Health Checks** and monitoring endpoints

## 📋 API Endpoints

### Products
- `GET /api/products` - Get all products (supports filtering)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/stats` - Get order statistics
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order

### System
- `GET /health` - Health check endpoint
- `GET /` - API information

## 🛠️ Installation
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## 🧪 Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint
```

## 🐳 Docker
```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## 📦 Project Structure
```
retail-app/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/          # Data models
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── __tests__/           # Unit and integration tests
├── package.json
└── README.md
```

## 🔐 Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)

## 📝 License

MIT