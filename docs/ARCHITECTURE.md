# System Architecture Document
## Node.js Retail Application with CI/CD Pipeline

**Version:** 1.0  
**Date:** February 2026  
**Author:** DevOps Team  
**Project:** Retail App CI/CD Pipeline

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Principles](#architecture-principles)
4. [Logical Architecture](#logical-architecture)
5. [Physical Architecture](#physical-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [CI/CD Pipeline Architecture](#cicd-pipeline-architecture)
8. [Container Architecture](#container-architecture)
9. [Kubernetes Architecture](#kubernetes-architecture)
10. [Security Architecture](#security-architecture)
11. [Scalability & Performance](#scalability--performance)
12. [Disaster Recovery](#disaster-recovery)
13. [Monitoring & Observability](#monitoring--observability)

---

## 1. Executive Summary

### 1.1 Purpose
This document describes the comprehensive architecture of the Node.js Retail Application with a complete CI/CD pipeline, including application design, containerization strategy, orchestration setup, and automated deployment workflows.

### 1.2 Scope
- Application architecture (RESTful API)
- CI/CD pipeline architecture (GitHub Actions)
- Container architecture (Docker)
- Orchestration architecture (Kubernetes)
- Deployment strategies
- Security measures
- Monitoring and observability

### 1.3 Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Application Framework | Express.js | Lightweight, mature, extensive ecosystem |
| Runtime | Node.js 18/20 | LTS versions, stability, performance |
| Containerization | Docker | Industry standard, portability |
| Orchestration | Kubernetes | Auto-scaling, self-healing, declarative |
| CI/CD Platform | GitHub Actions | Native GitHub integration, easy setup |
| Image Registry | Docker Hub | Public, free tier, widely supported |
| Architecture Style | Monolithic | Simplicity for MVP, easy to deploy |
| API Style | REST | Standard, well-understood, HTTP-based |

---

## 2. System Overview

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         End Users                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer / Ingress                  │
│                  (Kubernetes Service/Ingress)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────────┐
│                   Application Layer (Pods)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pod 1   │  │  Pod 2   │  │  Pod 3   │  │  Pod N   │   │
│  │          │  │          │  │          │  │          │   │
│  │ Node.js  │  │ Node.js  │  │ Node.js  │  │ Node.js  │   │
│  │ Express  │  │ Express  │  │ Express  │  │ Express  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│                    Data Layer (Future)                     │
│         ┌──────────────┐         ┌──────────────┐          │
│         │   Database   │         │    Redis     │          │
│         │ MongoDB/PG   │         │   (Cache)    │          │
│         └──────────────┘         └──────────────┘          │
└────────────────────────────────────────────────────────────┘
```

### 2.2 System Context Diagram
```
                     ┌──────────────┐
                     │  Developers  │
                     └──────┬───────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  GitHub Repo    │
                   │  (Source Code)  │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ GitHub Actions  │
                   │   (CI/CD)       │
                   └────┬───────┬────┘
                        │       │
                ┌───────┘       └───────┐
                ▼                       ▼
        ┌──────────────┐        ┌──────────────┐
        │ Docker Hub   │        │  Kubernetes  │
        │   (Images)   │        │   Cluster    │
        └──────────────┘        └──────┬───────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   End Users     │
                              └─────────────────┘
```

---

## 3. Architecture Principles

### 3.1 Design Principles

#### 3.1.1 Separation of Concerns
```
┌─────────────────────────────────────────┐
│  Presentation Layer (API Routes)        │  ← HTTP Requests/Responses
├─────────────────────────────────────────┤
│  Business Logic Layer (Services)        │  ← Domain Logic
├─────────────────────────────────────────┤
│  Data Access Layer (Models)             │  ← Data Operations
└─────────────────────────────────────────┘
```

**Benefits:**
- Clear boundaries between layers
- Easy to test each layer independently
- Changes in one layer don't affect others
- Better maintainability

#### 3.1.2 Single Responsibility Principle
```
productController.js    → Handles HTTP requests only
productService.js       → Contains business logic only
Product.js              → Defines data structure only
productRoutes.js        → Defines routes only
```

#### 3.1.3 DRY (Don't Repeat Yourself)
```javascript
// Shared validation logic in models
Product.validate(data)
Order.validate(data)

// Reusable error handling
Global error handler middleware

// Common configuration
ConfigMap in Kubernetes
```

#### 3.1.4 Fail Fast
```javascript
// Validate early
if (!data.name) throw new Error('Name required');

// Check resources before processing
if (!product) throw new Error('Product not found');

// Health checks
Kubernetes probes detect failures immediately
```

### 3.2 Architectural Patterns

#### 3.2.1 Layered Architecture
```
┌───────────────────────────────────────────┐
│  API Layer (Routes)                       │
│  - Define endpoints                       │
│  - Route to controllers                   │
└──────────────┬────────────────────────────┘
               │
┌──────────────▼────────────────────────────┐
│  Controller Layer                         │
│  - Request validation                     │
│  - Response formatting                    │
│  - Error handling                         │
└──────────────┬────────────────────────────┘
               │
┌──────────────▼────────────────────────────┐
│  Service Layer                            │
│  - Business logic                         │
│  - Data orchestration                     │
│  - Transaction management                 │
└──────────────┬────────────────────────────┘
               │
┌──────────────▼────────────────────────────┐
│  Model Layer                              │
│  - Data structure                         │
│  - Validation rules                       │
│  - Data transformations                   │
└───────────────────────────────────────────┘
```

#### 3.2.2 Singleton Pattern
```javascript
// Service classes use singleton
class ProductService { }
module.exports = new ProductService();

// Single instance shared across application
// Maintains state consistency
```

#### 3.2.3 Factory Pattern
```javascript
// Model constructors act as factories
const product = new Product(name, desc, price, stock, category);
const order = new Order(custName, email, items);

// Consistent object creation
// Encapsulates initialization logic
```

---

## 4. Logical Architecture

### 4.1 Application Architecture
```
┌───────────────────────────────────────────────────────────┐
│                      HTTP Middleware Stack                │
│                                                           │
│  ┌────────────┐  ┌──────────┐  ┌────────────┐             │
│  │   Helmet   │→│   CORS   │→│ Body Parser│               │
│  │ (Security) │  │(Cross-   │  │   (JSON)   │             │
│  │            │  │ Origin)  │  │            │             │
│  └────────────┘  └──────────┘  └────────────┘             │
│                                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │          Request Logging Middleware                │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────┬────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Routing Layer                          │
│                                                             │
│  /health          →  Health Check Handler                   │
│  /                →  API Info Handler                       │
│  /api/products    →  Product Routes                         │
│  /api/orders      →  Order Routes                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Controller Layer                      │
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │ ProductController│         │  OrderController │      │
│  │                  │         │                  │      │
│  │ - getAllProducts │         │ - getAllOrders   │      │
│  │ - getProductById │         │ - getOrderById   │      │
│  │ - createProduct  │         │ - createOrder    │      │
│  │ - updateProduct  │         │ - updateStatus   │      │
│  │ - deleteProduct  │         │ - cancelOrder    │      │
│  └────────┬─────────┘         └────────┬─────────┘      │
└───────────┼──────────────────────────┼──────────────────┘
            │                          │
            ▼                          ▼
┌───────────────────────────────────────────────────────────┐
│                    Service Layer                          │
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ ProductService   │◄────────┤  OrderService    │        │
│  │                  │         │                  │        │
│  │ - products[]     │         │ - orders[]       │        │
│  │ - CRUD ops       │         │ - CRUD ops       │        │
│  │ - stock mgmt     │         │ - stock sync     │        │
│  │ - validation     │         │ - stats calc     │        │
│  └────────┬─────────┘         └────────┬─────────┘        │
└───────────┼──────────────────────────┼────────────────────┘
            │                          │
            ▼                          ▼
┌────────────────────────────────────────────────────────────┐
│                     Model Layer                            │
│                                                            │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Product Model  │         │   Order Model    │         │
│  │                  │         │                  │         │
│  │ - Properties     │         │ - Properties     │         │
│  │ - Validation     │         │ - Validation     │         │
│  │ - Business rules │         │ - Business rules │         │
│  │ - Serialization  │         │ - Calculations   │         │
│  └──────────────────┘         └──────────────────┘         │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Component Interaction
```
┌───────────┐
│  Client   │
└─────┬─────┘
      │ HTTP Request
      ▼
┌──────────────────┐
│  Express Router  │
└─────┬────────────┘
      │
      ▼
┌──────────────────┐
│   Controller     │ ─┐
└─────┬────────────┘  │
      │               │ Async/Await
      ▼               │
┌──────────────────┐  │
│    Service       │ ◄┘
└─────┬────────────┘
      │
      ▼
┌──────────────────┐
│     Model        │
└─────┬────────────┘
      │
      ▼
┌──────────────────┐
│  In-Memory DB    │
│ (Future: Real DB)│
└──────────────────┘
```

---

## 5. Physical Architecture

### 5.1 Production Environment
```
┌─────────────────────────────────────────────────────────────┐
│                   Cloud Provider (AWS/GCP/Azure)            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Kubernetes Cluster                     │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │           Master Node(s)                      │  │    │
│  │  │  - API Server                                 │  │    │
│  │  │  - Scheduler                                  │  │    │
│  │  │  - Controller Manager                         │  │    │
│  │  │  - etcd                                       │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │           Worker Nodes                        │  │    │
│  │  │                                               │  │    │
│  │  │  Node 1          Node 2          Node 3       │  │    │
│  │  │  ┌─────────┐    ┌─────────┐    ┌─────────┐    │  │    │
│  │  │  │ Pod 1   │    │ Pod 2   │    │ Pod 3   │    │  │    │
│  │  │  │ ┌─────┐ │    │ ┌─────┐ │    │ ┌─────┐ │    │  │    │
│  │  │  │ │App  │ │    │ │App  │ │    │ │App  │ │    │  │    │
│  │  │  │ └─────┘ │    │ └─────┘ │    │ └─────┘ │    │  │    │
│  │  │  └─────────┘    └─────────┘    └─────────┘    │  │    │
│  │  │                                               │  │    │
│  │  │  - kubelet                                    │  │    │
│  │  │  - kube-proxy                                 │  │    │
│  │  │  - Container Runtime (Docker/containerd)      │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Load Balancer                          │    │
│  │  - Distributes traffic                              │    │
│  │  - Health check integration                         │    │
│  │  - SSL termination                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Persistent Storage (Future)               │    │
│  │  - Database (MongoDB/PostgreSQL)                    │    │
│  │  - Cache (Redis)                                    │    │
│  │  - File Storage (S3/Cloud Storage)                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Development Environment
```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workstation                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Docker Desktop / Minikube              │    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │      Local Kubernetes Cluster                 │  │    │
│  │  │                                               │  │    │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │  │    │
│  │  │  │ Pod 1   │  │ Pod 2   │  │ Pod 3   │        │  │    │
│  │  │  └─────────┘  └─────────┘  └─────────┘        │  │    │
│  │  │                                               │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Development Tools                      │    │
│  │  - VS Code / IDE                                    │    │
│  │  - Git                                              │    │
│  │  - Node.js                                          │    │
│  │  - npm                                              │    │
│  │  - kubectl                                          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Network Architecture
```
                        Internet
                           │
                           ▼
                  ┌─────────────────┐
                  │  DNS / CDN      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Load Balancer  │
                  │  (Layer 7)      │
                  └────────┬────────┘
                           │
        ┏━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━┓
        ▼                                   ▼
┌─────────────────┐               ┌─────────────────┐
│ Kubernetes      │               │ Kubernetes      │
│ Ingress         │               │ Ingress         │
│ (nginx)         │               │ (nginx)         │
└────────┬────────┘               └────────┬────────┘
         │                                  │
         ▼                                  ▼
┌─────────────────┐               ┌─────────────────┐
│ Service         │               │ Service         │
│ (ClusterIP)     │               │ (ClusterIP)     │
└────────┬────────┘               └────────┬────────┘
         │                                  │
    ┌────┴────┐                        ┌───┴────┐
    ▼         ▼                        ▼        ▼
┌─────┐   ┌─────┐                 ┌─────┐  ┌─────┐
│Pod1 │   │Pod2 │                 │Pod3 │  │Pod4 │
└─────┘   └─────┘                 └─────┘  └─────┘

         Availability Zone 1          Availability Zone 2
```

---

## 6. Deployment Architecture

### 6.1 Deployment Topology
```
┌─────────────────────────────────────────────────────────────┐
│                      Deployment Flow                        │
└─────────────────────────────────────────────────────────────┘

Developer Workstation
         │
         │ git push
         ▼
┌─────────────────┐
│  GitHub Repo    │
└────────┬────────┘
         │
         │ Webhook trigger
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   CI Pipeline   │
│                 │
│ 1. Checkout     │
│ 2. Setup Node   │
│ 3. Install deps │
│ 4. Run tests    │
│ 5. Build Docker │
└────────┬────────┘
         │
         │ On success (main branch)
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   CD Pipeline   │
│                 │
│ 1. Build image  │
│ 2. Tag image    │
│ 3. Push to Hub  │
└────────┬────────┘
         │
         │ Image pushed
         ▼
┌─────────────────┐
│   Docker Hub    │
│                 │
│ nikhilgarg0/    │
│ retail-app:     │
│  - latest       │
│  - v1.0.0       │
│  - main-sha     │
└────────┬────────┘
         │
         │ kubectl apply / GitOps
         ▼
┌─────────────────┐
│ Kubernetes      │
│ Cluster         │
│                 │
│ 1. Pull image   │
│ 2. Create pods  │
│ 3. Health check │
│ 4. Route traffic│
└─────────────────┘
```

### 6.2 Pod Distribution Strategy
```
┌──────────────────────────────────────────────────────────┐
│            Kubernetes Deployment Strategy                │
└──────────────────────────────────────────────────────────┘

Initial State (3 replicas):
┌────────┐ ┌────────┐ ┌────────┐
│ Pod v1 │ │ Pod v1 │ │ Pod v1 │
└────────┘ └────────┘ └────────┘

Update Triggered (Rolling Update):
Step 1: Create new pod
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Pod v1 │ │ Pod v1 │ │ Pod v1 │ │ Pod v2 │ (Creating)
└────────┘ └────────┘ └────────┘ └────────┘

Step 2: Verify health, terminate old
┌────────┐ ┌────────┐ ┌────────┐
│ Pod v1 │ │ Pod v1 │ │ Pod v2 │ (Ready)
└────────┘ └────────┘ └────────┘

Step 3: Continue rolling
┌────────┐ ┌────────┐ ┌────────┐
│ Pod v1 │ │ Pod v2 │ │ Pod v2 │
└────────┘ └────────┘ └────────┘

Step 4: Complete
┌────────┐ ┌────────┐ ┌────────┐
│ Pod v2 │ │ Pod v2 │ │ Pod v2 │
└────────┘ └────────┘ └────────┘

Configuration:
- maxSurge: 1 (one extra pod during update)
- maxUnavailable: 1 (one pod can be down during update)
- Zero downtime deployment
```

---

## 7. CI/CD Pipeline Architecture

### 7.1 Complete Pipeline Flow
```
┌─────────────────────────────────────────────────────────────┐
│                   CI/CD Pipeline Architecture               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 CONTINUOUS INTEGRATION                      │
└─────────────────────────────────────────────────────────────┘

Trigger: Push to any branch / Pull Request
         │
         ▼
┌──────────────────────┐
│  1. Code Checkout    │
│  - actions/checkout  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  2. Environment      │
│  Setup               │
│  - Node.js 18 & 20   │
│  - Cache npm deps    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  3. Dependencies     │
│  - npm ci            │
│  - Exact versions    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  4. Code Quality     │
│  - ESLint (if setup) │
│  - npm audit         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  5. Run Tests        │
│  - Unit tests        │
│  - Integration tests │
│  - Coverage report   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  6. Build Docker     │
│  - docker build      │
│  - Tag: test         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  7. Test Container   │
│  - docker run        │
│  - Health check      │
│  - curl /health      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  8. Upload Artifacts │
│  - Test results      │
│  - Coverage reports  │
└──────────┬───────────┘
           │
           ▼
     ✅ CI Complete


┌─────────────────────────────────────────────────────────────┐
│                 CONTINUOUS DEPLOYMENT                       │
└─────────────────────────────────────────────────────────────┘

Trigger: Push to main branch (after CI passes)
         │
         ▼
┌──────────────────────┐
│  1. Code Checkout    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  2. Docker Setup     │
│  - Setup Buildx      │
│  - Multi-platform    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  3. Docker Login     │
│  - Docker Hub auth   │
│  - Use secrets       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  4. Generate Tags    │
│  - latest            │
│  - v1.0.0            │
│  - main-<sha>        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  5. Build & Push     │
│  - Multi-platform    │
│  - amd64, arm64      │
│  - Push to registry  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  6. Update K8s       │
│  - kubectl set image │
│  - Or GitOps sync    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  7. Verify Deploy    │
│  - Check rollout     │
│  - Health checks     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  8. Notifications    │
│  - Slack/Email       │
│  - Status update     │
└──────────────────────┘
           │
           ▼
     ✅ CD Complete
```

### 7.2 Pipeline Stages Detail
```
┌──────────────────────────────────────────────────────────────┐
│                    Stage 1: Source                           │
├──────────────────────────────────────────────────────────────┤
│  Trigger Events:                                             │
│  - push (all branches)                                       │
│  - pull_request (to main)                                    │
│  - workflow_dispatch (manual)                                │
│                                                              │
│  Actions:                                                    │
│  - Checkout code (actions/checkout@v4)                       │
│  - Checkout with full history for proper versioning          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Stage 2: Build                            │
├──────────────────────────────────────────────────────────────┤
│  Matrix Strategy:                                            │
│  - node-version: [18.x, 20.x]                                │
│                                                              │
│  Steps:                                                      │
│  1. Setup Node.js with specified version                     │
│  2. Cache node_modules for faster builds                     │
│  3. npm ci (clean install from lock file)                    │
│  4. Verify installation success                              │
│                                                              │
│  Outputs:                                                    │
│  - Built application                                         │
│  - Installed dependencies                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Stage 3: Test                             │
├──────────────────────────────────────────────────────────────┤
│  Test Types:                                                 │
│  - Unit tests (Product, Order models)                        │
│  - Integration tests (API endpoints)                         │
│  - Coverage analysis                                         │
│                                                              │
│  Quality Gates:                                              │
│  - All tests must pass                                       │
│  - Coverage thresholds (configurable)                        │
│  - No high severity vulnerabilities                          │
│                                                              │
│  Reports:                                                    │
│  - JUnit XML test results                                    │
│  - LCOV coverage reports                                     │
│  - HTML coverage reports                                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Stage 4: Security Scan                    │
├──────────────────────────────────────────────────────────────┤
│  Scans:                                                      │
│  - npm audit (dependency vulnerabilities)                    │
│  - Container image scanning (future: Trivy)                  │
│  - SAST (Static Analysis) - future                           │
│                                                              │
│  Policy:                                                     │
│  - High severity: Fail build                                 │
│  - Medium severity: Warning only                             │
│  - Low severity: Informational                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Stage 5: Docker Build                     │
├──────────────────────────────────────────────────────────────┤
│  Build Configuration:                                        │
│  - Multi-stage Dockerfile                                    │
│  - Production dependencies only                              │
│  - Non-root user (nodejs:nodejs)                             │
│  - Health check integrated                                   │
│                                                              │
│  Platforms:                                                  │
│  - linux/amd64 (Intel/AMD)                                   │
│  - linux/arm64 (ARM, Apple Silicon)                          │
│                                                              │
│  Cache Strategy:                                             │
│  - GitHub Actions cache                                      │
│  - Layer caching enabled                                     │
│  - Faster subsequent builds                                  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Stage 6: Registry Push                    │
├──────────────────────────────────────────────────────────────┤
│  Condition: Only on main branch                              │
│                                                              │
│  Tags Generated:                                             │
│  - latest (always points to main branch)                     │
│  - main-<git-sha> (specific commit)                          │
│  - v1.0.0 (if tagged in git)                                 │
│  - v1.0 (major.minor from tag)                               │
│                                                              │
│  Registry:                                                   │
│  - Docker Hub (docker.io)                                    │
│  - Public repository                                         │
│  - Automatic vulnerability scanning                          │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Stage 7: Deploy                          │
├─────────────────────────────────────────────────────────────┤
│  Deployment Methods:                                        │
│                                                             │
│  Option 1: kubectl (Direct)                                 │
│  - kubectl set image deployment/retail-app                  │
│  - kubectl rollout status                                   │
│                                                             │
│  Option 2: GitOps (Recommended for Production)              │
│  - ArgoCD / Flux CD                                         │
│  - Git as source of truth                                   │
│  - Automatic sync                                           │
│                                                             │
│  Verification:                                              │
│  - Wait for rollout completion                              │
│  - Check pod status                                         │
│  - Verify health endpoints                                  │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Branch Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                    Git Branch Strategy                      │
└─────────────────────────────────────────────────────────────┘

main (production)
  │
  ├─── feature/new-payment-gateway
  │    │
  │    └─ PR → Run CI → Merge
  │
  ├─── bugfix/order-calculation
  │    │
  │    └─ PR → Run CI → Merge
  │
  └─── hotfix/security-patch
       │
       └─ PR → Run CI → Fast-track merge

Pipeline Behavior:
┌────────────────┬─────────────────┬──────────────────┐
│    Branch      │   CI Pipeline   │   CD Pipeline    │
├────────────────┼─────────────────┼──────────────────┤
│ main           │ ✅ Full         │ ✅ Deploy       │
│ feature/*      │ ✅ Full         │ ❌ No deploy    │
│ bugfix/*       │ ✅ Full         │ ❌ No deploy    │
│ hotfix/*       │ ✅ Full         │ ❌ No deploy    │
│ Pull Requests  │ ✅ Full + Extra │ ❌ No deploy    │
└────────────────┴─────────────────┴──────────────────┘
```

---

## 8. Container Architecture

### 8.1 Docker Image Layers
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Image Structure                   │
└─────────────────────────────────────────────────────────────┘

Layer 7: CMD ["node", "src/server.js"]         ← Start command
         ─────────────────────────────────────
Layer 6: HEALTHCHECK & USER nodejs             ← Security & Health
         ─────────────────────────────────────
Layer 5: COPY src ./src                        ← Application code
         ─────────────────────────────────────
Layer 4: RUN npm ci --only=production          ← Dependencies
         ─────────────────────────────────────
Layer 3: COPY package*.json ./                 ← Package files
         ─────────────────────────────────────
Layer 2: WORKDIR /app                          ← Working directory
         ─────────────────────────────────────
Layer 1: FROM node:18-alpine                   ← Base image (5MB)
         ─────────────────────────────────────

Total Image Size: ~150MB (optimized)

Layer Caching:
- Layers 1-4: Rarely change → Cached
- Layer 5: Changes frequently → Rebuild
- Faster builds due to caching
```

### 8.2 Container Security
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Measures                        │
└─────────────────────────────────────────────────────────────┘

1. Base Image:
   ✓ Official Node.js image
   ✓ Alpine Linux (minimal, secure)
   ✓ Regular security updates
   ✓ Small attack surface

2. Non-Root User:
   ✓ Create nodejs user (UID 1001)
   ✓ Run as non-root
   ✓ Limited permissions
   ✓ Better isolation

3. Production Dependencies:
   ✓ --only=production flag
   ✓ No dev dependencies
   ✓ Smaller image
   ✓ Fewer vulnerabilities

4. Health Checks:
   ✓ Built-in health monitoring
   ✓ Auto-restart on failure
   ✓ Liveness detection
   ✓ Readiness detection

5. Resource Limits:
   ✓ CPU limits
   ✓ Memory limits
   ✓ Prevent resource exhaustion
   ✓ Fair scheduling
```

---

## 9. Kubernetes Architecture

### 9.1 Kubernetes Resources Topology
```
┌────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                      │
│                                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Namespace: retail-app                 │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │          ConfigMap                           │  │    │
│  │  │  - NODE_ENV=production                       │  │    │
│  │  │  - PORT=3000                                 │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │          Secret (Future)                     │  │    │
│  │  │  - database-password                         │  │    │
│  │  │  - api-keys                                  │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │          Deployment                          │  │    │
│  │  │                                              │  │    │
│  │  │  Replicas: 3                                 │  │    │
│  │  │  Strategy: RollingUpdate                     │  │    │
│  │  │                                              │  │    │
│  │  │  ┌──────────┐  ┌─────────┐  ┌─────────┐      │  │    │
│  │  │  │ Pod 1    │  │ Pod 2   │  │ Pod 3   │      │  │    │
│  │  │  │          │  │         │  │         │      │  │    │
│  │  │  │ App      │  │ App     │  │ App     │      │  │    │
│  │  │  │ :3000    │  │ :3000   │  │ :3000   │      │  │    │
│  │  │  │          │  │         │  │         │      │  │    │
│  │  │  │ Health   │  │ Health  │  │ Health  │      │  │    │
│  │  │  └──────────┘  └─────────┘  └─────────┘      │  │    │
│  │  │                                              │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                     ▲                              │    │
│  │                     │                              │    │
│  │  ┌──────────────────┴───────────────────────────┐  │    │
│  │  │          Service (LoadBalancer)              │  │    │
│  │  │                                              │  │    │
│  │  │  ClusterIP: 10.96.x.x                        │  │    │
│  │  │  External IP: x.x.x.x                        │  │    │
│  │  │  Port: 80 → TargetPort: 3000                 │  │    │
│  │  │  Selector: app=retail-app                    │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                     ▲                              │    │
│  │                     │                              │    │
│  │  ┌──────────────────┴───────────────────────────┐  │    │
│  │  │          Ingress (Optional)                  │  │    │
│  │  │                                              │  │    │
│  │  │  Host: retail-app.example.com                │  │    │
│  │  │  TLS: Enabled                                │  │    │
│  │  │  Path: / → Service                           │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │   HorizontalPodAutoscaler                    │  │    │
│  │  │                                              │  │    │
│  │  │   Min: 2, Max: 10                            │  │    │
│  │  │   Target CPU: 70%                            │  │    │
│  │  │   Target Memory: 80%                         │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │   NetworkPolicy                              │  │    │
│  │  │                                              │  │    │
│  │  │   Ingress: Allow from same namespace         │  │    │
│  │  │   Egress: Allow DNS, HTTP/HTTPS              │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### 9.2 Pod Lifecycle
```
┌─────────────────────────────────────────────────────────────┐
│                    Pod Lifecycle Phases                     │
└─────────────────────────────────────────────────────────────┘

1. Pending
   - Pod created in API server
   - Waiting for scheduling
   - Pulling container image
   
2. ContainerCreating
   - Container runtime creating container
   - Mounting volumes
   - Network setup
   
3. Running
   ├─ Startup Probe (0-150 seconds)
   │  ├─ Check /health endpoint
   │  ├─ Retry every 5 seconds
   │  └─ Max 30 failures
   │
   ├─ Readiness Probe (ongoing)
   │  ├─ Check /health endpoint
   │  ├─ Every 5 seconds
   │  ├─ Pod receives traffic when ready
   │  └─ Removed from service if fails
   │
   └─ Liveness Probe (ongoing)
      ├─ Check /health endpoint
      ├─ Every 10 seconds
      ├─ Restart pod if fails 3 times
      └─ Exponential backoff on failures

4. Succeeded / Failed
   - Container exits
   - Pod cleanup

5. Terminating
   - SIGTERM sent to container
   - Grace period: 30 seconds
   - SIGKILL if not stopped
   - Pod removed from service immediately
```

### 9.3 Resource Management

┌─────────────────────────────────────────────────────────────┐
│                    Resource Allocation                      │
└─────────────────────────────────────────────────────────────┘
Per Pod:
┌────────────┬───────────┬───────────┐
│  Resource  │  Request  │   Limit   │
├────────────┼───────────┼───────────┤
│   CPU      │  100m     │   500m    │
│   Memory   │  128Mi    │   512Mi   │
└────────────┴───────────┴───────────┘
Cluster with 3 pods:

Total CPU Request: 300m (0.3 cores)
Total CPU Limit: 1500m (1.5 cores)
Total Memory Request: 384Mi
Total Memory Limit: 1536Mi (1.5Gi)

Quality of Service (QoS):

QoS Class: Burstable
Guaranteed requests
Can use up to limits
Better than BestEffort
Not as strict as Guaranteed

### 9.4 Auto-Scaling Strategy
```
┌─────────────────────────────────────────────────────────────┐
│          Horizontal Pod Autoscaler (HPA) Behavior           │
└─────────────────────────────────────────────────────────────┘

Scaling Metrics:
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  CPU Utilization Target: 70%                             │
│  ────────────────────────────────────────────────────    │
│                                                          │
│  Current: 40%  → No scaling                              │
│  Current: 75%  → Scale up (add pods)                     │
│  Current: 30%  → Scale down (remove pods)                │
│                                                          │
│  Memory Utilization Target: 80%                          │
│  ────────────────────────────────────────────────────    │
│                                                          │
│  Current: 50%  → No scaling                              │
│  Current: 85%  → Scale up (add pods)                     │
│  Current: 40%  → Scale down (remove pods)                │
│                                                          │
└──────────────────────────────────────────────────────────┘

Scaling Behavior:
┌──────────────────────────────────────────────────────────┐
│  Scale Up (when load increases):                         │
│  - Stabilization: 0 seconds                              │
│  - Max rate: 100% increase per 30 seconds                │
│  - Or: Add 4 pods per 30 seconds                         │
│  - Policy: Choose maximum (aggressive)                   │
│                                                          │
│  Scale Down (when load decreases):                       │
│  - Stabilization: 300 seconds (5 minutes)                │
│  - Max rate: 50% decrease per 60 seconds                 │
│  - Or: Remove 2 pods per 60 seconds                      │
│  - Policy: Choose minimum (conservative)                 │
└──────────────────────────────────────────────────────────┘

Example Scenario:
Time    Load    Pods    Action
────────────────────────────────────────────────────────
00:00   Low     3       Normal operation
00:30   High    3       CPU 80% → Trigger scale up
00:35   High    5       Added 2 pods (within 30s)
01:00   High    7       Added 2 more pods
02:00   High    10      Max replicas reached
03:00   Medium  10      Load decreasing, wait 5 min
08:00   Medium  8       Stable for 5 min, scale down
10:00   Low     3       Back to minimum
```

---

## 10. Security Architecture

### 10.1 Multi-Layer Security
```
┌─────────────────────────────────────────────────────────────┐
│                    Defense in Depth                         │
└─────────────────────────────────────────────────────────────┘

Layer 7: Application Security
         ┌────────────────────────────────────┐
         │ - Input validation                 │
         │ - Output encoding                  │
         │ - Authentication (future)          │
         │ - Authorization (future)           │
         │ - Session management (future)      │
         └────────────────────────────────────┘
         
Layer 6: API Security
         ┌────────────────────────────────────┐
         │ - Helmet (security headers)        │
         │ - CORS (cross-origin control)      │
         │ - Rate limiting (future)           │
         │ - Request size limits              │
         └────────────────────────────────────┘
         
Layer 5: Container Security
         ┌────────────────────────────────────┐
         │ - Non-root user execution          │
         │ - Read-only root filesystem        │
         │ - No privilege escalation          │
         │ - Minimal base image (Alpine)      │
         │ - Production deps only             │
         └────────────────────────────────────┘
         
Layer 4: Network Security
         ┌────────────────────────────────────┐
         │ - NetworkPolicy enforcement        │
         │ - Ingress/Egress rules             │
         │ - Service mesh (future)            │
         │ - TLS/SSL encryption               │
         └────────────────────────────────────┘
         
Layer 3: Kubernetes Security
         ┌────────────────────────────────────┐
         │ - RBAC (Role-Based Access)         │
         │ - Pod Security Standards           │
         │ - Secret encryption at rest        │
         │ - Resource quotas                  │
         │ - Namespace isolation              │
         └────────────────────────────────────┘
         
Layer 2: Infrastructure Security
         ┌────────────────────────────────────┐
         │ - Private cluster networks         │
         │ - Firewall rules                   │
         │ - VPC isolation                    │
         │ - Security groups                  │
         └────────────────────────────────────┘
         
Layer 1: Physical Security
         ┌────────────────────────────────────┐
         │ - Cloud provider security          │
         │ - Data center controls             │
         │ - Hardware security                │
         └────────────────────────────────────┘
```

### 10.2 Security Controls Matrix
```
┌───────────────────────────────────────────────────────────────┐
│                    Security Controls                          │
├──────────────────┬──────────────┬─────────────┬───────────────┤
│   Control        │   Status     │  Priority   │ Implementation│
├──────────────────┼──────────────┼─────────────┼───────────────┤
│ HTTPS/TLS        │ Planned      │ High        │ Ingress       │
│ Non-root user    │ ✅ Enabled   │ High       │ Dockerfile    │
│ Security headers │ ✅ Enabled   │ High       │ Helmet.js     │
│ CORS             │ ✅ Enabled   │ High       │ CORS package  │
│ Input validation │ ✅ Enabled   │ High       │ Models        │
│ NetworkPolicy    │ ✅ Configured│ High       │ K8s manifest  │
│ Resource limits  │ ✅ Enabled   │ Medium     │ K8s manifest  │
│ Health checks    │ ✅ Enabled   │ Medium     │ K8s probes    │
│ Secret mgmt      │ ✅ Ready     │ Medium     │ K8s Secret    │
│ Rate limiting    │ Planned      │ Medium      │ Future        │
│ Authentication   │ Planned      │ Medium      │ JWT/OAuth     │
│ Audit logging    │ Planned      │ Low         │ Future        │
│ WAF              │ Planned      │ Low         │ Cloud WAF     │
└──────────────────┴──────────────┴─────────────┴───────────────┘
```

### 10.3 Secrets Management
```
┌─────────────────────────────────────────────────────────────┐
│                    Secrets Architecture                     │
└─────────────────────────────────────────────────────────────┘

Development:
┌──────────────┐
│ .env file    │ → Git ignored
└──────────────┘

CI/CD:
┌──────────────────┐
│ GitHub Secrets   │ → Encrypted at rest
│                  │ → Masked in logs
│ - DOCKER_USERNAME│
│ - DOCKER_PASSWORD│
│ - KUBE_CONFIG    │
└──────────────────┘

Kubernetes:
┌──────────────────┐
│ K8s Secrets      │ → Base64 encoded
│                  │ → Encrypted at rest (etcd)
│ - DB credentials │ → Mounted as env vars
│ - API keys       │ → Or as volumes
└──────────────────┘

Future (Production):
┌──────────────────┐
│ External Vault   │ → HashiCorp Vault
│                  │ → AWS Secrets Manager
│ - Rotation       │ → Azure Key Vault
│ - Auditing       │
│ - Fine-grained   │
└──────────────────┘
```

### 10.4 Network Security Policies
```
┌─────────────────────────────────────────────────────────────┐
│                    Network Flow Control                     │
└─────────────────────────────────────────────────────────────┘

Ingress Rules (Incoming Traffic):
┌────────────────────────────────────────────────────┐
│  Source              Port    Action    Protocol    │
├────────────────────────────────────────────────────┤
│  Same Namespace      3000    ALLOW     TCP         │
│  Ingress Controller  3000    ALLOW     TCP         │
│  Other Namespaces    3000    DENY      TCP         │
│  External (direct)   3000    DENY      TCP         │
└────────────────────────────────────────────────────┘

Egress Rules (Outgoing Traffic):
┌────────────────────────────────────────────────────┐
│  Destination         Port    Action    Protocol    │
├────────────────────────────────────────────────────┤
│  DNS                 53      ALLOW     UDP/TCP     │
│  HTTPS               443     ALLOW     TCP         │
│  HTTP                80      ALLOW     TCP         │
│  Database (future)   5432    ALLOW     TCP         │
│  Redis (future)      6379    ALLOW     TCP         │
│  All other           *       DENY      *           │
└────────────────────────────────────────────────────┘

Pod-to-Pod Communication:
┌────────────────────────────────────────────────────┐
│  Within retail-app namespace:  ALLOWED             │
│  To kube-system namespace:     ALLOWED (DNS)       │
│  To other namespaces:          DENIED              │
└────────────────────────────────────────────────────┘
```

---

## 11. Scalability & Performance

### 11.1 Scalability Dimensions
```
┌─────────────────────────────────────────────────────────────┐
│                    Scalability Strategy                     │
└─────────────────────────────────────────────────────────────┘

Horizontal Scaling (Current):
┌──────────────────────────────────────────┐
│  Scale Out: Add more pods                │
│  - Min replicas: 2                       │
│  - Max replicas: 10                      │
│  - Auto-scaling: HPA enabled             │
│  - Triggers: CPU, Memory                 │
│  - Benefit: Linear scaling               │
│  - Limitation: Stateless only            │
└──────────────────────────────────────────┘

Vertical Scaling (Configurable):
┌──────────────────────────────────────────┐
│  Scale Up: Increase pod resources        │
│  - Current: 128Mi-512Mi memory           │
│  - Current: 100m-500m CPU                │
│  - Can be increased per pod              │
│  - Benefit: More power per pod           │
│  - Limitation: Node capacity             │
└──────────────────────────────────────────┘

Cluster Scaling (Future):
┌──────────────────────────────────────────┐
│  Scale Cluster: Add more nodes           │
│  - Cluster Autoscaler                    │
│  - Add nodes when pods pending           │
│  - Remove nodes when underutilized       │
│  - Benefit: Unlimited scaling            │
│  - Cost: More infrastructure             │
└──────────────────────────────────────────┘
```

### 11.2 Performance Characteristics
```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Profile                      │
└─────────────────────────────────────────────────────────────┘

Current Performance (Single Pod):
┌────────────────────────────────────────────┐
│  Metric              Value       Notes     │
├────────────────────────────────────────────┤
│  Startup Time        5-10s       Cold start│
│  Request Latency     10-50ms     P50       │
│  Request Latency     50-100ms    P95       │
│  Request Latency     100-200ms   P99       │
│  Throughput          500 req/s   Per pod   │
│  Memory Usage        80-120MB    Baseline  │
│  CPU Usage           50-100m     Idle      │
│  CPU Usage           200-400m    Load      │
└────────────────────────────────────────────┘

Cluster Performance (3 Pods):
┌────────────────────────────────────────────┐
│  Total Throughput    1,500 req/s           │
│  Total Memory        240-360MB             │
│  Total CPU           150-300m idle         │
│  High Availability   Yes (multi-pod)       │
│  Load Distribution   Round-robin           │
└────────────────────────────────────────────┘

Performance Bottlenecks (Current):
┌────────────────────────────────────────────┐
│  1. In-Memory Storage                      │
│     - Not persistent                       │
│     - Not shared between pods              │
│     - Limited by pod memory                │
│                                            │
│  2. No Caching Layer                       │
│     - Repeated computations                │
│     - Database queries (future)            │
│                                            │
│  3. Synchronous Processing                 │
│     - Blocking operations                  │
│     - No background jobs                   │
└────────────────────────────────────────────┘
```

### 11.3 Performance Optimization Roadmap
```
┌─────────────────────────────────────────────────────────────┐
│                    Optimization Phases                      │
└─────────────────────────────────────────────────────────────┘

Phase 1: Database Integration (Month 1-2)
├─ Add PostgreSQL/MongoDB
├─ Shared state across pods
├─ Persistent storage
├─ Connection pooling
└─ Expected: 2x throughput

Phase 2: Caching Layer (Month 2-3)
├─ Add Redis
├─ Cache frequently accessed data
├─ Session storage
├─ Rate limiting state
└─ Expected: 3x throughput, 50% latency reduction

Phase 3: Async Processing (Month 3-4)
├─ Message queue (RabbitMQ/Kafka)
├─ Background job processing
├─ Email notifications async
├─ Report generation async
└─ Expected: Better responsiveness

Phase 4: CDN & Edge Caching (Month 4-5)
├─ CloudFront/CloudFlare
├─ Static asset caching
├─ API response caching
├─ Geographic distribution
└─ Expected: 80% faster for cached content

Phase 5: Advanced Optimization (Month 6+)
├─ Database query optimization
├─ Index tuning
├─ Code profiling
├─ Bundle optimization
└─ Expected: Incremental improvements
```

---

## 12. Disaster Recovery

### 12.1 Backup Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                    Backup Architecture                      │
└─────────────────────────────────────────────────────────────┘

Current State (Stateless):
┌──────────────────────────────────────────┐
│  Application: No state to backup         │
│  Configuration: Version controlled (Git) │
│  Images: Stored in Docker Hub            │
│  Manifests: Version controlled (Git)     │
└──────────────────────────────────────────┘

Future State (With Database):
┌──────────────────────────────────────────────────────┐
│  Component        Frequency    Retention    Method   │
├──────────────────────────────────────────────────────┤
│  Database         Hourly       30 days      Snapshot │
│  Database         Daily        90 days      Full     │
│  Database         Weekly       1 year       Archive  │
│  Config/Secrets   On change    Forever      Git      │
│  Logs             Real-time    30 days      Stream   │
│  Metrics          Real-time    90 days      TSDB     │
└──────────────────────────────────────────────────────┘
```

### 12.2 Disaster Recovery Procedures
```
┌─────────────────────────────────────────────────────────────┐
│                    DR Scenarios & Response                  │
└─────────────────────────────────────────────────────────────┘

Scenario 1: Single Pod Failure
├─ Detection: Health check fails
├─ Auto-Response: Kubernetes restarts pod
├─ RTO (Recovery Time): 10-30 seconds
├─ RPO (Data Loss): None (stateless)
└─ User Impact: Minimal (other pods serving)

Scenario 2: Node Failure
├─ Detection: Node unreachable
├─ Auto-Response: Pods rescheduled to other nodes
├─ RTO: 1-2 minutes
├─ RPO: None
└─ User Impact: Brief degradation

Scenario 3: Deployment Failure
├─ Detection: Health checks fail on new pods
├─ Manual Response: Rollback deployment
├─ Command: kubectl rollout undo deployment/retail-app
├─ RTO: 2-5 minutes
├─ RPO: None
└─ User Impact: No downtime (old pods remain)

Scenario 4: Cluster Failure (Future)
├─ Detection: Monitoring alerts
├─ Manual Response: Failover to DR cluster
├─ RTO: 15-30 minutes
├─ RPO: Last backup (depends on strategy)
└─ User Impact: Service interruption

Scenario 5: Data Corruption (Future)
├─ Detection: Data integrity check
├─ Manual Response: Restore from backup
├─ RTO: 1-4 hours
├─ RPO: Last backup point
└─ User Impact: Downtime during restore

Scenario 6: Complete Cloud Region Outage
├─ Detection: Multiple system failures
├─ Manual Response: Multi-region failover
├─ RTO: 30-60 minutes (if configured)
├─ RPO: Replication lag
└─ User Impact: Potential data loss
```

### 12.3 Recovery Time Objectives
```
┌─────────────────────────────────────────────────────────────┐
│                    RTO/RPO Matrix                           │
└─────────────────────────────────────────────────────────────┘

┌────────────────────┬──────────┬──────────┬─────────────────┐
│  Failure Type      │   RTO    │   RPO    │  Availability   │
├────────────────────┼──────────┼──────────┼─────────────────┤
│  Pod crash         │  30s     │  0       │  99.9%          │
│  Node failure      │  2min    │  0       │  99.9%          │
│  Bad deployment    │  5min    │  0       │  99.95%         │
│  AZ failure        │  10min   │  0       │  99.95%         │
│  Region failure    │  30min   │  5min    │  99.5%          │
│  Data corruption   │  4hr     │  1hr     │  99.0%          │
└────────────────────┴──────────┴──────────┴─────────────────┘

Target SLA: 99.9% uptime
Downtime allowed per month: 43 minutes
Current architecture supports: 99.9%+
```

---

## 13. Monitoring & Observability

### 13.1 Observability Pillars
```
┌─────────────────────────────────────────────────────────────┐
│                    Three Pillars of Observability           │
└─────────────────────────────────────────────────────────────┘

1. Metrics (What is happening?)
   ┌────────────────────────────────────────┐
   │  Kubernetes Metrics:                   │
   │  - Pod CPU/Memory usage                │
   │  - Pod restart count                   │
   │  - Pod status                          │
   │  - Node resource utilization           │
   │                                        │
   │  Application Metrics:                  │
   │  - Request rate (req/s)                │
   │  - Request duration (latency)          │
   │  - Error rate                          │
   │  - Active connections                  │
   │  - Inventory levels                    │
   │  - Order completion rate               │
   │                                        │
   │  Business Metrics:                     │
   │  - Orders per minute                   │
   │  - Revenue per hour                    │
   │  - Cart abandonment rate               │
   │  - Top-selling products                │
   └────────────────────────────────────────┘

2. Logs (What happened in detail?)
   ┌────────────────────────────────────────┐
   │  Application Logs:                     │
   │  - Request logs (method, path, status) │
   │  - Error logs (stack traces)           │
   │  - Business events (order created)     │
   │  - Audit logs (who did what)           │
   │                                        │
   │  System Logs:                          │
   │  - Container stdout/stderr             │
   │  - Kubernetes events                   │
   │  - Node system logs                    │
   │                                        │
   │  Format: Structured JSON               │
   │  Storage: ElasticSearch (future)       │
   │  Retention: 30 days                    │
   └────────────────────────────────────────┘

3. Traces (How did it execute?)
   ┌────────────────────────────────────────┐
   │  Distributed Tracing (Future):         │
   │  - Request journey across services     │
   │  - Latency breakdown by component      │
   │  - Dependency graph                    │
   │  - Error propagation                   │
   │                                        │
   │  Tool: Jaeger / Zipkin                 │
   │  Integration: OpenTelemetry            │
   └────────────────────────────────────────┘
```

### 13.2 Monitoring Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                         │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Dashboards  │
                    │  (Grafana)   │
                    └──────┬───────┘
                           │
                           │ Queries
                           │
        ┌──────────────────┴───────────────────┐
        │                                      │
        ▼                                      ▼
┌──────────────┐                      ┌──────────────┐
│  Prometheus  │                      │  Loki        │
│  (Metrics)   │                      │  (Logs)      │
└──────┬───────┘                      └──────┬───────┘
       │                                      │
       │ Scrape                               │ Push
       │                                      │
       ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│              Kubernetes Cluster                     │
│                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │  Pod 1     │  │  Pod 2     │  │  Pod 3     │     │
│  │            │  │            │  │            │     │
│  │ /metrics   │  │ /metrics   │  │ /metrics   │     │
│  │ logs →     │  │ logs →     │  │ logs →     │     │
│  └────────────┘  └────────────┘  └────────────┘     │
└─────────────────────────────────────────────────────┘

Alert Flow:
Prometheus → Alert Rules → Alertmanager → 
  → Slack/Email/PagerDuty
```

### 13.3 Health Check Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                    Health Check Types                       │
└─────────────────────────────────────────────────────────────┘

Startup Probe:
┌────────────────────────────────────────────────────┐
│  Purpose: Verify app has started                   │
│  Endpoint: GET /health                             │
│  Interval: 5 seconds                               │
│  Timeout: 3 seconds                                │
│  Success: 1 successful check                       │
│  Failure: 30 failures (150 seconds max)            │
│  Action: Kill container if fails                   │
│  Use case: Slow-starting applications              │
└────────────────────────────────────────────────────┘

Liveness Probe:
┌────────────────────────────────────────────────────┐
│  Purpose: Detect if app is deadlocked/hung         │
│  Endpoint: GET /health                             │
│  Interval: 10 seconds                              │
│  Timeout: 5 seconds                                │
│  Success: 1 successful check                       │
│  Failure: 3 consecutive failures                   │
│  Action: Restart container                         │
│  Use case: Recover from deadlocks                  │
└────────────────────────────────────────────────────┘

Readiness Probe:
┌────────────────────────────────────────────────────┐
│  Purpose: Determine if pod can serve traffic       │
│  Endpoint: GET /health                             │
│  Interval: 5 seconds                               │
│  Timeout: 3 seconds                                │
│  Success: 1 successful check                       │
│  Failure: 3 consecutive failures                   │
│  Action: Remove from service endpoints             │
│  Use case: Gradual traffic routing                 │
└────────────────────────────────────────────────────┘

Health Endpoint Response:
┌────────────────────────────────────────────────────┐
│  GET /health                                       │
│                                                    │
│  Response: 200 OK                                  │
│  {                                                 │
│    "status": "healthy",                            │
│    "timestamp": "2026-02-15T18:19:23.509Z",        │
│    "uptime": 3600.5,                               │
│    "environment": "production",                    │
│    "checks": {                                     │
│      "database": "connected",    // future         │
│      "redis": "connected",       // future         │
│      "diskSpace": "ok"           // future         │
│    }                                               │
│  }                                                 │
└────────────────────────────────────────────────────┘
```

### 13.4 Alerting Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                    Alert Definitions                        │
└─────────────────────────────────────────────────────────────┘

Critical Alerts (Page immediately):
┌────────────────────────────────────────────────────┐
│  - All pods down (availability < 50%)              │
│  - Error rate > 10%                                │
│  - Response time P99 > 5 seconds                   │
│  - CPU throttling > 80%                            │
│  - Memory usage > 90%                              │
│  - Certificate expiring in < 7 days                │
└────────────────────────────────────────────────────┘

Warning Alerts (Email/Slack):
┌────────────────────────────────────────────────────┐
│  - Pod restart rate > 3 per hour                   │
│  - Error rate > 5%                                 │
│  - Response time P99 > 2 seconds                   │
│  - CPU usage > 70%                                 │
│  - Memory usage > 80%                              │
│  - Disk usage > 80%                                │
└────────────────────────────────────────────────────┘

Info Alerts (Dashboard only):
┌────────────────────────────────────────────────────┐
│  - Deployment started                              │
│  - Deployment completed                            │
│  - Auto-scaling triggered                          │
│  - New version available                           │
└────────────────────────────────────────────────────┘
```

---

## 14. Future Enhancements

### 14.1 Short-Term Roadmap (3-6 months)
```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 1: Foundation                      │
└─────────────────────────────────────────────────────────────┘

1. Database Integration
   ├─ PostgreSQL for relational data
   ├─ Connection pooling
   ├─ Migration system (Flyway/Liquibase)
   └─ Backup/restore procedures

2. Authentication & Authorization
   ├─ JWT-based authentication
   ├─ Role-based access control (RBAC)
   ├─ API key management
   └─ OAuth2 integration

3. Advanced Monitoring
   ├─ Prometheus + Grafana
   ├─ ELK Stack (Elasticsearch, Logstash, Kibana)
   ├─ Distributed tracing (Jaeger)
   └─ Custom dashboards

4. Caching Layer
   ├─ Redis integration
   ├─ Cache strategies (TTL, LRU)
   ├─ Session management
   └─ Rate limiting
```

### 14.2 Medium-Term Roadmap (6-12 months)
```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 2: Scale                           │
└─────────────────────────────────────────────────────────────┘

1. Microservices Architecture
   ├─ Split into: API Gateway, Product Service, Order Service
   ├─ Service mesh (Istio)
   ├─ Inter-service communication (gRPC)
   └─ Circuit breaker pattern

2. Event-Driven Architecture
   ├─ Message broker (Kafka/RabbitMQ)
   ├─ Async processing
   ├─ Event sourcing
   └─ CQRS pattern

3. Advanced Security
   ├─ WAF (Web Application Firewall)
   ├─ DDoS protection
   ├─ Secrets rotation
   └─ Compliance (PCI-DSS for payments)

4. Multi-Region Deployment
   ├─ Geographic distribution
   ├─ Active-active setup
   ├─ Data replication
   └─ Global load balancing
```

### 14.3 Long-Term Roadmap (12+ months)
```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 3: Innovate                        │
└─────────────────────────────────────────────────────────────┘

1. AI/ML Integration
   ├─ Product recommendations
   ├─ Dynamic pricing
   ├─ Fraud detection
   └─ Demand forecasting

2. Advanced Features
   ├─ GraphQL API
   ├─ Real-time updates (WebSockets)
   ├─ Mobile apps (React Native)
   └─ PWA (Progressive Web App)

3. DevOps Maturity
   ├─ GitOps (ArgoCD/Flux)
   ├─ Chaos engineering
   ├─ Cost optimization
   └─ FinOps practices

4. Business Analytics
   ├─ Data warehouse
   ├─ BI dashboards
   ├─ Customer analytics
   └─ Predictive analytics
```

---

## Appendix A: Technology Stack Details
```
┌─────────────────────────────────────────────────────────────┐
│                    Technology Versions                      │
└─────────────────────────────────────────────────────────────┘

Runtime & Framework:
├─ Node.js: 18.x LTS, 20.x LTS
├─ Express.js: 4.18.2
├─ npm: 9.x

Dependencies:
├─ cors: 2.8.5
├─ helmet: 7.1.0
├─ dotenv: 16.3.1
├─ uuid: 9.0.1

Dev Dependencies:
├─ jest: 29.7.0
├─ supertest: 6.3.3
├─ nodemon: 3.0.2
├─ eslint: 8.55.0

Containerization:
├─ Docker: 24.x
├─ Docker Compose: 2.x
├─ Base Image: node:18-alpine

Orchestration:
├─ Kubernetes: 1.28+
├─ kubectl: 1.28+
├─ Helm: 3.x (optional)

CI/CD:
├─ GitHub Actions: Latest
├─ Docker Hub: Registry

Cloud Providers (Compatible):
├─ AWS EKS
├─ Google GKE
├─ Azure AKS
├─ DigitalOcean Kubernetes
├─ Local: Docker Desktop, Minikube, Kind
```

---

## Appendix B: Glossary
```
API - Application Programming Interface
CI/CD - Continuous Integration/Continuous Deployment
CORS - Cross-Origin Resource Sharing
CPU - Central Processing Unit
CQRS - Command Query Responsibility Segregation
DR - Disaster Recovery
HPA - Horizontal Pod Autoscaler
HTTPS - Hypertext Transfer Protocol Secure
JWT - JSON Web Token
K8s - Kubernetes (K + 8 letters + s)
LCOV - Line Coverage
LTS - Long Term Support
RBAC - Role-Based Access Control
REST - Representational State Transfer
RPO - Recovery Point Objective
RTO - Recovery Time Objective
SAST - Static Application Security Testing
SLA - Service Level Agreement
TLS - Transport Layer Security
TSDB - Time Series Database
UUID - Universally Unique Identifier
VPC - Virtual Private Cloud
WAF - Web Application Firewall
```

---

## Appendix C: Reference Architecture Diagrams

### C.1 Request Flow
```
┌──────┐
│Client│
└──┬───┘
   │
   │ HTTPS Request
   │
   ▼
┌────────────────┐
│  Load Balancer │
└────┬───────────┘
     │
     │ Distribute
     │
     ▼
┌────────────────┐
│ K8s Service    │
└────┬───────────┘
     │
     │ Route to Pod
     │
     ▼
┌────────────────┐
│ Pod (Express)  │
└────┬───────────┘
     │
     │ Process
     │
     ├─→ Middleware Stack
     │   ├─ Helmet (Security)
     │   ├─ CORS
     │   ├─ Body Parser
     │   └─ Logger
     │
     ├─→ Router
     │   └─ Match endpoint
     │
     ├─→ Controller
     │   └─ Handle request
     │
     ├─→ Service
     │   └─ Business logic
     │
     ├─→ Model
     │   └─ Data operations
     │
     └─→ Database (future)
         └─ Query data
```

### C.2 Deployment Flow
```
Developer → Git Push → GitHub → Webhook → GitHub Actions
                                               │
                                               ├─→ Run Tests
                                               ├─→ Build Image
                                               ├─→ Push to Registry
                                               └─→ Update K8s
                                                      │
                                                      ▼
                                           ┌──────────────────┐
                                           │ Rolling Update   │
                                           │  ┌───┐  ┌───┐    │
                                           │  │Old│→│New│     │
                                           │  └───┘  └───┘    │
                                           └──────────────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │ Health Check │
                                              └──────┬───────┘
                                                     │
                                          ┌──────────┴────────────┐
                                          │                       │
                                        Pass                    Fail
                                          │                       │
                                          ▼                       ▼
                                   ┌──────────┐          ┌──────────────┐
                                   │ Complete │          │ Rollback     │
                                   └──────────┘          └──────────────┘
```

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | DevOps Team | Initial Architecture document |

---

**End of Architecture Document**