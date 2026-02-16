# Low-Level Design (LLD) Document
## Node.js Retail Application with CI/CD Pipeline

**Version:** 1.0  
**Date:** February 2026  
**Author:** DevOps Team  
**Project:** Retail App CI/CD Pipeline

---

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Component Design](#component-design)
4. [API Design](#api-design)
5. [Database Design](#database-design)
6. [Class Diagrams](#class-diagrams)
7. [Sequence Diagrams](#sequence-diagrams)
8. [Error Handling](#error-handling)
9. [Security Design](#security-design)
10. [Testing Strategy](#testing-strategy)

---

## 1. Introduction

### 1.1 Purpose
This document provides the low-level design specifications for the Node.js Retail Application with complete CI/CD pipeline implementation using GitHub Actions, Docker, and Kubernetes.

### 1.2 Scope
- RESTful API for retail operations (Products & Orders)
- Automated testing and deployment pipeline
- Containerized deployment architecture
- Kubernetes orchestration configuration

### 1.3 Technologies
- **Runtime:** Node.js 18/20
- **Framework:** Express.js 4.18.x
- **Testing:** Jest 29.x, Supertest 6.x
- **Containerization:** Docker, Docker Compose
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Security:** Helmet, CORS

---

## 2. System Overview

### 2.1 Architecture Layers
```
┌─────────────────────────────────────────┐
│         API Layer (Routes)              │
├─────────────────────────────────────────┤
│      Controller Layer (Handlers)        │
├─────────────────────────────────────────┤
│     Service Layer (Business Logic)      │
├─────────────────────────────────────────┤
│       Model Layer (Data Models)         │
└─────────────────────────────────────────┘
```

### 2.2 Request Flow
```
Client Request
    ↓
Express Middleware (CORS, Helmet, Body Parser)
    ↓
Router (Product/Order Routes)
    ↓
Controller (Request Validation)
    ↓
Service (Business Logic)
    ↓
Model (Data Operations)
    ↓
Response (JSON)
```

---

## 3. Component Design

### 3.1 Application Structure
```
src/
├── app.js                    # Express application setup
├── server.js                 # Server initialization
├── controllers/              # Request handlers
│   ├── productController.js
│   └── orderController.js
├── models/                   # Data models
│   ├── Product.js
│   └── Order.js
├── routes/                   # API routes
│   ├── productRoutes.js
│   └── orderRoutes.js
└── services/                 # Business logic
    ├── productService.js
    └── orderService.js
```

### 3.2 Component Responsibilities

#### 3.2.1 App.js
**Purpose:** Express application configuration and middleware setup

**Responsibilities:**
- Initialize Express application
- Configure middleware (CORS, Helmet, Body Parser)
- Register routes
- Setup error handlers
- Define health check endpoint

**Key Functions:**
```javascript
// Middleware stack
- helmet()                    // Security headers
- cors()                      // Cross-origin resource sharing
- express.json()              // JSON body parser
- express.urlencoded()        // URL-encoded body parser
- Custom logging middleware

// Routes
- GET /health                 // Health check
- GET /                       // API info
- /api/products              // Product routes
- /api/orders                // Order routes

// Error Handlers
- 404 handler
- Global error handler
```

#### 3.2.2 Server.js
**Purpose:** HTTP server initialization and lifecycle management

**Responsibilities:**
- Load environment variables
- Create and start HTTP server
- Handle graceful shutdown
- Export server instance for testing

**Key Functions:**
```javascript
- app.listen(PORT)            // Start server
- process.on('SIGTERM')       // Graceful shutdown
- module.exports = server     // Export for testing
```

---

## 4. API Design

### 4.1 Product API

#### 4.1.1 Get All Products
```
Method: GET
Endpoint: /api/products
Query Parameters:
  - category: string (optional)
  - minPrice: number (optional)
  - maxPrice: number (optional)

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "price": number,
      "stock": number,
      "category": "string",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}

Error Response: 500
{
  "success": false,
  "error": "Error message"
}
```

#### 4.1.2 Get Product by ID
```
Method: GET
Endpoint: /api/products/:id
Path Parameters:
  - id: string (required, UUID)

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": number,
    "stock": number,
    "category": "string",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}

Error Response: 404 Not Found
{
  "success": false,
  "error": "Product not found"
}
```

#### 4.1.3 Create Product
```
Method: POST
Endpoint: /api/products
Request Body:
{
  "name": "string" (required),
  "description": "string",
  "price": number (required, > 0),
  "stock": number (required, >= 0),
  "category": "string"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": number,
    "stock": number,
    "category": "string",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}

Error Response: 400 Bad Request
{
  "success": false,
  "error": "Validation error message"
}
```

#### 4.1.4 Update Product
```
Method: PUT
Endpoint: /api/products/:id
Path Parameters:
  - id: string (required, UUID)
Request Body: (all optional)
{
  "name": "string",
  "description": "string",
  "price": number,
  "stock": number,
  "category": "string"
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated product */ }
}

Error Response: 404 Not Found / 400 Bad Request
```

#### 4.1.5 Delete Product
```
Method: DELETE
Endpoint: /api/products/:id
Path Parameters:
  - id: string (required, UUID)

Response: 200 OK
{
  "success": true,
  "message": "Product deleted successfully"
}

Error Response: 404 Not Found / 400 Bad Request
```

### 4.2 Order API

#### 4.2.1 Get All Orders
```
Method: GET
Endpoint: /api/orders
Query Parameters:
  - status: string (optional: pending|processing|completed|cancelled)
  - customerEmail: string (optional)

Response: 200 OK
{
  "success": true,
  "count": number,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-timestamp",
      "customerName": "string",
      "customerEmail": "string",
      "items": [
        {
          "productId": "uuid",
          "productName": "string",
          "quantity": number,
          "price": number
        }
      ],
      "totalAmount": number,
      "status": "string",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

#### 4.2.2 Create Order
```
Method: POST
Endpoint: /api/orders
Request Body:
{
  "customerName": "string" (required),
  "customerEmail": "string" (required, valid email),
  "items": [
    {
      "productId": "uuid" (required),
      "quantity": number (required, > 0)
    }
  ] (required, length > 0)
}

Response: 201 Created
{
  "success": true,
  "data": { /* order object */ }
}

Business Logic:
1. Validate customer information
2. Validate each product exists
3. Check stock availability for each item
4. Calculate total amount using current prices
5. Deduct stock from inventory
6. Create order with status 'pending'
7. Return created order

Error Response: 400 Bad Request
{
  "success": false,
  "error": "Validation error or insufficient stock"
}
```

#### 4.2.3 Update Order Status
```
Method: PATCH
Endpoint: /api/orders/:id/status
Request Body:
{
  "status": "string" (required: pending|processing|completed|cancelled)
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated order */ }
}

Error Response: 400 Bad Request / 404 Not Found
```

#### 4.2.4 Cancel Order
```
Method: POST
Endpoint: /api/orders/:id/cancel

Business Logic:
1. Validate order exists
2. Check order is not already completed
3. Restore stock for all items
4. Update order status to 'cancelled'
5. Return updated order

Response: 200 OK
{
  "success": true,
  "data": { /* cancelled order */ }
}

Error Response: 400 Bad Request (if already completed) / 404 Not Found
```

#### 4.2.5 Get Order Statistics
```
Method: GET
Endpoint: /api/orders/stats

Response: 200 OK
{
  "success": true,
  "data": {
    "totalOrders": number,
    "totalRevenue": number,
    "ordersByStatus": {
      "pending": number,
      "processing": number,
      "completed": number,
      "cancelled": number
    }
  }
}
```

---

## 5. Database Design

### 5.1 Current Implementation
**Storage Type:** In-Memory (for demonstration)

**Note:** In production, replace with:
- MongoDB for NoSQL approach
- PostgreSQL for relational approach
- Redis for caching layer

### 5.2 Data Models

#### 5.2.1 Product Schema
```javascript
{
  id: UUID (Primary Key, Auto-generated),
  name: String (Required, Non-empty),
  description: String (Optional),
  price: Number (Required, Positive),
  stock: Number (Required, Non-negative),
  category: String (Optional),
  createdAt: ISO8601 Timestamp (Auto-generated),
  updatedAt: ISO8601 Timestamp (Auto-updated)
}

Indexes:
- Primary: id
- Secondary: category (for filtering)
```

#### 5.2.2 Order Schema
```javascript
{
  id: UUID (Primary Key, Auto-generated),
  orderNumber: String (Auto-generated: "ORD-{timestamp}"),
  customerName: String (Required, Non-empty),
  customerEmail: String (Required, Valid email format),
  items: Array [
    {
      productId: UUID (Foreign Key → Product.id),
      productName: String (Denormalized for history),
      quantity: Number (Positive integer),
      price: Number (Snapshot at order time)
    }
  ] (Required, Non-empty array),
  totalAmount: Number (Calculated field),
  status: Enum (pending|processing|completed|cancelled),
  createdAt: ISO8601 Timestamp (Auto-generated),
  updatedAt: ISO8601 Timestamp (Auto-updated)
}

Indexes:
- Primary: id
- Secondary: orderNumber (unique)
- Secondary: customerEmail (for customer queries)
- Secondary: status (for filtering)
```

### 5.3 Relationships
```
Product (1) ←→ (N) OrderItem
Order (1) ←→ (N) OrderItem

Note: Order items store price snapshot (denormalized)
to preserve historical pricing accuracy
```

---

## 6. Class Diagrams

### 6.1 Product Class
```
┌─────────────────────────────┐
│         Product             │
├─────────────────────────────┤
│ - id: string                │
│ - name: string              │
│ - description: string       │
│ - price: number             │
│ - stock: number             │
│ - category: string          │
│ - createdAt: string         │
│ - updatedAt: string         │
├─────────────────────────────┤
│ + constructor(...)          │
│ + static validate(data)     │
│ + updateStock(quantity)     │
│ + toJSON()                  │
└─────────────────────────────┘
```

**Methods:**
```javascript
constructor(name, description, price, stock, category)
  - Generates unique UUID
  - Initializes all properties
  - Sets timestamps

static validate(productData): Array<string>
  - Validates name (non-empty)
  - Validates price (positive number)
  - Validates stock (non-negative)
  - Returns array of error messages

updateStock(quantity: number): void
  - Checks for negative stock
  - Throws error if insufficient
  - Updates stock
  - Updates timestamp

toJSON(): Object
  - Returns JSON representation
  - All fields included
```

### 6.2 Order Class
```
┌─────────────────────────────┐
│          Order              │
├─────────────────────────────┤
│ - id: string                │
│ - orderNumber: string       │
│ - customerName: string      │
│ - customerEmail: string     │
│ - items: Array              │
│ - totalAmount: number       │
│ - status: string            │
│ - createdAt: string         │
│ - updatedAt: string         │
├─────────────────────────────┤
│ + constructor(...)          │
│ + calculateTotal()          │
│ + static validate(data)     │
│ + updateStatus(status)      │
│ + toJSON()                  │
└─────────────────────────────┘
```

**Methods:**
```javascript
constructor(customerName, customerEmail, items)
  - Generates unique UUID
  - Generates order number
  - Calculates total amount
  - Sets status to 'pending'
  - Sets timestamps

calculateTotal(): number
  - Iterates through items
  - Sums (price * quantity)
  - Returns total amount

static validate(orderData): Array<string>
  - Validates customer name (non-empty)
  - Validates email (contains @)
  - Validates items (array, non-empty)
  - Returns array of error messages

updateStatus(newStatus: string): void
  - Validates status is valid
  - Throws error if invalid
  - Updates status
  - Updates timestamp

toJSON(): Object
  - Returns JSON representation
  - All fields included
```

### 6.3 Service Classes
```
┌──────────────────────────────────┐
│      ProductService              │
├──────────────────────────────────┤
│ - products: Array<Product>       │
├──────────────────────────────────┤
│ + constructor()                  │
│ + initializeSampleProducts()     │
│ + getAllProducts(filters)        │
│ + getProductById(id)             │
│ + createProduct(data)            │
│ + updateProduct(id, updates)     │
│ + deleteProduct(id)              │
│ + checkStock(id, quantity)       │
│ + updateStock(id, quantity)      │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│       OrderService               │
├──────────────────────────────────┤
│ - orders: Array<Order>           │
├──────────────────────────────────┤
│ + constructor()                  │
│ + getAllOrders(filters)          │
│ + getOrderById(id)               │
│ + createOrder(data)              │
│ + updateOrderStatus(id, status)  │
│ + cancelOrder(id)                │
│ + getOrderStats()                │
└──────────────────────────────────┘
```

---

## 7. Sequence Diagrams

### 7.1 Create Order Flow
```
Client          Controller        Service          ProductService    Model
  │                 │                │                   │              │
  │─POST /orders──→ │                │                   │              │
  │                 │                │                   │              │
  │                 │─validate()────→│                   │              │
  │                 │                │                   │              │
  │                 │                │─getProduct(id)───→│              │
  │                 │                │←─product───────── │              │
  │                 │                │                   │              │
  │                 │                │─checkStock()─────→│              │
  │                 │                │←─true/false────── │              │
  │                 │                │                   │              │
  │                 │                │                   │─new Order()─→│
  │                 │                │                   │              │
  │                 │                │─updateStock()────→│              │
  │                 │                │←─updated───────── │              │
  │                 │                │                   │              │
  │                 │←─order─────────│                   │              │
  │                 │                │                   │              │
  │←─201 Created──  │                │                   │              │
  │                 │                │                   │              │
```

### 7.2 Product Creation Flow
```
Client          Controller        Service          Model
  │                 │                │               │
  │─POST /products→ │                │               │
  │                 │                │               │
  │                 │─validate()────→│               │
  │                 │←─errors[]───── │               │
  │                 │                │               │
  │                 │                │─new Product()→│
  │                 │                │               │
  │                 │←─product────── │               │
  │                 │                │               │
  │←─201 Created──  │                │               │
  │                 │                │               │
```

### 7.3 Cancel Order Flow
```
Client          Controller        Service          ProductService
  │                 │                │                   │
  │─POST /cancel──→ │                │                   │
  │                 │                │                   │
  │                 │─cancelOrder()─→│                   │
  │                 │                │                   │
  │                 │                │─getOrder()───────→│
  │                 │                │                   │
  │                 │                │─check status───── │
  │                 │                │                   │
  │                 │                │─restoreStock()───→│
  │                 │                │                   │
  │                 │                │─updateStatus()─── │
  │                 │                │                   │
  │                 │←─cancelled──── │                   │
  │                 │                │                   │
  │←─200 OK───────  │                │                   │
  │                 │                │                   │
```

---

## 8. Error Handling

### 8.1 Error Types
```javascript
// Validation Error (400)
{
  "success": false,
  "error": "Product name is required, Price must be positive"
}

// Not Found Error (404)
{
  "success": false,
  "error": "Product not found"
}

// Server Error (500)
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error (only in development)"
}
```

### 8.2 Error Handling Strategy

**Controller Level:**
```javascript
try {
  // Business logic
  const result = service.operation();
  res.json({ success: true, data: result });
} catch (error) {
  // Determine error type
  if (error.message === 'Not found') {
    res.status(404).json({ success: false, error: error.message });
  } else {
    res.status(400).json({ success: false, error: error.message });
  }
}
```

**Service Level:**
```javascript
// Throw meaningful errors
if (!resource) {
  throw new Error('Resource not found');
}

// Validation errors
const errors = Model.validate(data);
if (errors.length > 0) {
  throw new Error(errors.join(', '));
}
```

**Global Error Handler:**
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

---

## 9. Security Design

### 9.1 Security Measures

#### 9.1.1 Application Security
```javascript
// Helmet - Security headers
app.use(helmet());

Headers Set:
- Content-Security-Policy
- X-DNS-Prefetch-Control
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection

// CORS - Cross-Origin Resource Sharing
app.use(cors());

Allowed:
- All origins (configurable in production)
- Credentials support
- Standard methods

// Input Validation
- All inputs validated at model level
- Type checking
- Range validation
- Format validation (email)
```

#### 9.1.2 Container Security
```dockerfile
# Non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Minimal base image
FROM node:18-alpine

# Production dependencies only
RUN npm ci --only=production
```

#### 9.1.3 Kubernetes Security
```yaml
# Resource limits
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# Network policies
- Ingress rules defined
- Egress rules defined
- Pod-to-pod communication controlled

# Security context (future enhancement)
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
```

### 9.2 Data Security

**In Transit:**
- HTTPS in production (Ingress with TLS)
- Secure headers with Helmet

**At Rest:**
- Environment variables for secrets
- Kubernetes secrets for sensitive data
- No hardcoded credentials

**Authentication (Future):**
- JWT tokens
- API key validation
- OAuth2 integration

---

## 10. Testing Strategy

### 10.1 Test Structure
```
__tests__/
├── product.test.js          # Unit tests for Product model
└── api.test.js              # Integration tests for API
```

### 10.2 Test Coverage

**Unit Tests (product.test.js):**
```javascript
Product Model:
✓ Product creation with all fields
✓ Unique ID generation
✓ Valid product validation
✓ Missing name validation error
✓ Invalid price validation error
✓ Negative stock validation error
✓ Multiple validation errors
✓ Stock update (positive)
✓ Stock update (negative)
✓ Insufficient stock error
✓ Timestamp update on stock change
✓ JSON serialization
```

**Integration Tests (api.test.js):**
```javascript
Health Check:
✓ GET /health returns healthy status

Root Endpoint:
✓ GET / returns API information

Product API:
✓ GET /api/products returns all products
✓ GET /api/products with category filter
✓ POST /api/products creates new product
✓ POST /api/products fails with invalid data
✓ GET /api/products/:id returns specific product
✓ GET /api/products/:id returns 404 for non-existent

Order API:
✓ GET /api/orders returns all orders
✓ POST /api/orders creates new order
✓ POST /api/orders fails with invalid email
✓ GET /api/orders/stats returns statistics

Error Handling:
✓ 404 for non-existent routes
```

### 10.3 Test Execution
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch

# Expected Coverage:
# Statements: 66%+
# Branches: 51%+
# Functions: 66%+
# Lines: 68%+
```

### 10.4 CI/CD Testing

**Automated in Pipeline:**
1. Unit tests run on every commit
2. Integration tests run on every PR
3. Tests run on multiple Node versions (18, 20)
4. Coverage reports generated
5. Security audit performed
6. Docker image build tested

---

## Appendix A: File Structure
```
retail-app/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── controllers/
│   │   ├── productController.js  # Product request handlers
│   │   └── orderController.js    # Order request handlers
│   ├── models/
│   │   ├── Product.js            # Product data model
│   │   └── Order.js              # Order data model
│   ├── routes/
│   │   ├── productRoutes.js      # Product API routes
│   │   └── orderRoutes.js        # Order API routes
│   └── services/
│       ├── productService.js     # Product business logic
│       └── orderService.js       # Order business logic
├── __tests__/
│   ├── product.test.js           # Product model tests
│   └── api.test.js               # API integration tests
├── .github/workflows/
│   ├── ci.yml                    # CI pipeline
│   ├── cd.yml                    # CD pipeline
│   └── pr-checks.yml             # PR validation
├── k8s/
│   ├── namespace.yaml            # K8s namespace
│   ├── configmap.yaml            # Configuration
│   ├── deployment.yaml           # Deployment spec
│   ├── service.yaml              # Service spec
│   ├── hpa.yaml                  # Auto-scaler
│   ├── ingress.yaml              # Ingress rules
│   ├── networkpolicy.yaml        # Network security
│   └── deploy.yaml               # All-in-one
├── Dockerfile                    # Container definition
├── docker-compose.yml            # Local orchestration
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
└── README.md                     # Documentation
```

---

## Appendix B: Environment Variables
```bash
# Application
NODE_ENV=production              # Environment mode
PORT=3000                        # Server port

# Database (Future)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retail_db
DB_USER=retail_user
DB_PASSWORD=secret

# Redis (Future)
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys (Future)
JWT_SECRET=your-secret-key
API_KEY=your-api-key

# Monitoring (Future)
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

---

## Appendix C: Performance Considerations

### C.1 Current Performance Characteristics

**In-Memory Storage:**
- Read: O(n) for filtering, O(1) for ID lookup
- Write: O(1) for create, O(n) for update/delete
- Suitable for: Demo, testing, small datasets
- Not suitable for: Production with >1000 records

### C.2 Optimization Recommendations

**Database Migration:**
```javascript
// Replace in-memory arrays with database
- MongoDB: Natural fit for JSON documents
- PostgreSQL: Better for complex queries, transactions
- Redis: Add as caching layer
```

**Query Optimization:**
```javascript
// Add indexes
- Product: id (primary), category, price
- Order: id (primary), customerEmail, status, createdAt
```

**Caching Strategy:**
```javascript
// Redis cache
- Product list (TTL: 5 min)
- Product details (TTL: 10 min)
- Order stats (TTL: 1 min)
```

**Pagination:**
```javascript
// Add pagination to list endpoints
GET /api/products?page=1&limit=20
GET /api/orders?page=1&limit=50
```

---

## Appendix D: Future Enhancements

### D.1 Short Term (1-2 months)
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Authentication & Authorization (JWT)
- [ ] API rate limiting
- [ ] Request logging (Winston/Morgan)
- [ ] Input sanitization
- [ ] Pagination for list endpoints

### D.2 Medium Term (3-6 months)
- [ ] Redis caching layer
- [ ] Advanced search & filtering
- [ ] File upload (product images)
- [ ] Email notifications
- [ ] Webhook integrations
- [ ] API documentation (Swagger/OpenAPI)

### D.3 Long Term (6-12 months)
- [ ] Microservices architecture
- [ ] Event-driven architecture (Kafka/RabbitMQ)
- [ ] GraphQL API
- [ ] Multi-tenancy support
- [ ] Advanced analytics
- [ ] Machine learning recommendations

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | DevOps Team | Initial LLD document |

---

**End of Low-Level Design Document**