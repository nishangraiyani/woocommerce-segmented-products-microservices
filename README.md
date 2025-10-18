# WooCommerce Segmented Products - Microservices

A full-stack microservices application that integrates with WooCommerce's REST API to ingest product data, store it locally, and enable users to define product segments using a text-based rule editor.

## 🌐 Live Demo

- **Frontend**: [https://woocommerce-frontend-wm5g.onrender.com](https://woocommerce-frontend-wm5g.onrender.com)
- **Gateway API**: [https://gateway-6dih.onrender.com](https://gateway-6dih.onrender.com)
- **Product Service**: [https://woocommerce-segmented-products.onrender.com](https://woocommerce-segmented-products.onrender.com)
- **Segment Service**: [https://segment-service-kwxc.onrender.com](https://segment-service-kwxc.onrender.com)

## 🏗️ Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│               Frontend (Next.js + React)                    │
│                    Port: 3000                               │
│          - Product Listing                                  │
│          - Segment Rule Editor                              │
│          - Pagination & Filtering                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  Gateway Service                            │
│                    Port: 5000                               │
│          - API Routing & Proxy                              │
│          - CORS & Security                                  │
│          - Rate Limiting (100 req/15min)                    │
│          - API Key Authentication                           │
│          - Response Caching (5 min TTL)                     │
│          - Health Checks                                    │
└────────────┬───────────────────────┬────────────────────────┘
             │                       │
             ↓                       ↓
┌────────────────────────┐  ┌───────────────────────────────┐
│   Product Service      │  │    Segment Service            │
│     Port: 5001         │  │      Port: 5002               │
│                        │  │                               │
│ - WooCommerce Sync     │  │ - Text Rule Parser            │
│ - Product Ingestion    │  │ - MongoDB Query Builder       │
│ - Cron Jobs (12h)      │  │ - Product Filtering           │
│ - Product CRUD APIs    │  │ - Rule Validation             │
│ - Swagger Docs         │  │ - Segment Evaluation          │
└────────────┬───────────┘  └──────────┬────────────────────┘
             │                          │
             └──────────┬───────────────┘
                        ↓
              ┌─────────────────────┐
              │   MongoDB Atlas     │
              │  (Cloud Database)   │
              │                     │
              │ - Products          │
              │ - Metadata          │
              └─────────────────────┘
                        ↑
                        │
              ┌─────────────────────┐
              │  WooCommerce API    │
              │  (External)         │
              └─────────────────────┘
```

## 📋 Features

### Core Functionality

- ✅ **WooCommerce Integration**: Automatic product synchronization
- ✅ **Local Data Storage**: MongoDB for fast queries
- ✅ **Text-Based Rule Editor**: Intuitive product segmentation
- ✅ **RESTful APIs**: Well-documented endpoints
- ✅ **Real-time Filtering**: Dynamic product segmentation
- ✅ **Pagination**: Efficient data loading
- ✅ **Cron-Based Sync**: Automated product updates every 12 hours

### Technical Features

- ✅ **Microservices Architecture**: Scalable and maintainable
- ✅ **API Gateway**: Centralized routing and security
- ✅ **Rate Limiting**: 100 requests per 15 minutes
- ✅ **Response Caching**: 5-minute TTL for GET requests
- ✅ **API Key Authentication**: Secure endpoint access
- ✅ **Health Monitoring**: Service status tracking
- ✅ **Docker Support**: Containerized deployment
- ✅ **Swagger Documentation**: Interactive API docs
- ✅ **Unit Tests**: 67 test cases with 97%+ coverage
- ✅ **ES Modules**: Modern JavaScript
- ✅ **npm Workspaces**: Monorepo management

## 🚀 Quick Start

You have **TWO options** to run this application:

### Option 1: Manual Setup (Local Development) 🔧

**Prerequisites:**

- **Node.js**: v18+
- **MongoDB**: Atlas account (free tier) or local MongoDB
- **WooCommerce**: API credentials

**Steps:**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd woocommerce-segmented-products-microservices
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env` files (NOT `.env.docker`) for each service:

   **`services/product-service/.env`**

   ```env
   PORT=5001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/products
   WC_BASE_URL=https://wp-multisite.convertcart.com
   WC_CONSUMER_KEY=ck_af82ae325fbee1c13f31eb26148f4dea473b0f77
   WC_CONSUMER_SECRET=cs_2d8cc467c5b91a80f5ed18dd3c282ee8299c9445
   ```

   **`services/segment-service/.env`**

   ```env
   PORT=5002
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/products
   ```

   **`services/gateway/.env`**

   ```env
   PORT=5000
   PRODUCT_SERVICE_URL=http://localhost:5001
   SEGMENT_SERVICE_URL=http://localhost:5002
   API_KEYS=dev-api-key-12345
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CACHE_TTL_SECONDS=300
   NODE_ENV=development
   ```

   **`app/.env.local`**

   ```env
   NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:5000
   NEXT_PUBLIC_API_KEY=dev-api-key-12345
   ```

4. **Start services (4 separate terminals)**

   ```bash
   # Terminal 1 - Product Service
   npm run dev:product-service

   # Terminal 2 - Segment Service
   npm run dev:segment-service

   # Terminal 3 - Gateway
   npm run dev:gateway-service

   # Terminal 4 - Frontend
   npm run dev:app
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Gateway: http://localhost:5000
   - Product Service Swagger: http://localhost:5001/docs
   - Segment Service Swagger: http://localhost:5002/docs

---

### Option 2: Docker Setup (Containerized) 🐳

**Steps:**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd woocommerce-segmented-products-microservices
   ```

2. **Configure environment variables**

   Create `.env.docker` files for each service:

   **`services/product-service/.env.docker`**

   ```env
   PORT=5001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/products
   WC_BASE_URL=https://wp-multisite.convertcart.com
   WC_CONSUMER_KEY=ck_af82ae325fbee1c13f31eb26148f4dea473b0f77
   WC_CONSUMER_SECRET=cs_2d8cc467c5b91a80f5ed18dd3c282ee8299c9445
   NODE_ENV=development
   ```

   **`services/segment-service/.env.docker`**

   ```env
   PORT=5002
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/products
   NODE_ENV=development
   ```

   **`services/gateway/.env.docker`**

   ```env
   PORT=5000
   PRODUCT_SERVICE_URL=http://product-service:5001
   SEGMENT_SERVICE_URL=http://segment-service:5002
   API_KEYS=dev-api-key-12345
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CACHE_TTL_SECONDS=300
   NODE_ENV=production
   ```

   **`app/.env.docker`**

   ```env
   NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:5000
   NEXT_PUBLIC_API_KEY=dev-api-key-12345
   ```

3. **Build and start all services**

   ```bash
   # Build Docker images
   docker-compose build

   # Start all services
   docker-compose up

   # Or run in detached mode (background)
   docker-compose up -d
   ```

4. **Access the application**

   - Frontend: http://localhost:3000
   - Gateway: http://localhost:5000
   - Gateway Health: http://localhost:5000/health

## 📚 API Documentation

### Gateway Endpoints

All API requests go through the Gateway at `http://localhost:5000/api`

**Authentication**: Include `x-api-key` header in all `/api/*` requests

#### Product Endpoints

**Get All Products**

```http
GET /api/products?page=1&limit=50
Headers:
  x-api-key: your-api-key
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": 12345,
      "title": "Product Name",
      "price": "99.99",
      "stock_status": "instock",
      "stock_quantity": 50,
      "category": "Electronics",
      "tags": ["sale", "new"],
      "on_sale": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "pages": 10
  }
}
```

**Trigger Product Ingestion**

```http
POST /api/products/ingest
Headers:
  x-api-key: your-api-key
```

#### Segment Endpoints

**Evaluate Segment Rules**

```http
POST /api/segments/evaluate
Headers:
  x-api-key: your-api-key
Content-Type: application/json

{
  "rules": "price > 100\nstock_status = instock\non_sale = true",
  "page": 1,
  "limit": 20
}
```

**Response:**

```json
{
  "success": true,
  "message": "Segment evaluated: 45 products match the criteria",
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

**Validate Rules**

```http
POST /api/segments/validate
Headers:
  x-api-key: your-api-key
Content-Type: application/json

{
  "rules": "price > 100\nstock_status = instock"
}
```

**Get Segment Metadata**

```http
GET /api/segments/meta
Headers:
  x-api-key: your-api-key
```

### Rule Syntax

The segment editor supports text-based conditions with the following syntax:

**Operators:**

- `=` - Equals
- `!=` - Not equals
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal

**Allowed Fields:**

- `title` - Product title (string)
- `price` - Product price (number as string)
- `stock_status` - Stock status: `instock`, `outofstock`, `onbackorder`
- `stock_quantity` - Stock quantity (number)
- `category` - Category name (string)
- `tags` - Product tags (string)
- `on_sale` - On sale status: `true` or `false`

**Example Rules:**

```
# Find expensive in-stock products on sale
price >= 500
price <= 2000
stock_status = instock
stock_quantity > 5
on_sale = true
category = Electronics
```

**Multiple Conditions:**

- One condition per line
- Lines starting with `#` are comments
- Empty lines are ignored
- All conditions are combined with AND logic
- Multiple conditions on the same field create range queries

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests for specific service
npm test --workspace=segment-service

# Run with coverage
npm run test:coverage --workspace=segment-service

# Watch mode
npm run test:watch --workspace=segment-service
```

### Test Coverage

**Segment Service - Rule Parser:**

- ✅ 100% function coverage

## 📁 Project Structure

```
woocommerce-segmented-products-microservices/
├── app/                          # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── page.tsx          # Main page
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/           # React components
│   │   │   ├── ProductCard.tsx   # Product display
│   │   │   ├── SegmentEditor.tsx # Rule editor
│   │   │   └── Pagination.tsx    # Pagination controls
│   │   └── services/             # API integration
│   │       └── api.ts            # API client
│   ├── public/                   # Static assets
│   ├── Dockerfile                # Docker config
│   └── package.json
│
├── services/
│   ├── gateway/                  # API Gateway
│   │   ├── src/
│   │   │   ├── index.js          # Main entry
│   │   │   ├── routes/
│   │   │   │   └── proxy.js      # Proxy configuration
│   │   │   ├── middleware/
│   │   │   │   ├── apiKeyAuth.js # API key auth
│   │   │   │   └── errorHandler.js
│   │   │   └── utils/
│   │   │       ├── cache.js      # Response caching
│   │   │       └── healthCheck.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── product-service/          # Product Service
│   │   ├── src/
│   │   │   ├── index.js          # Main entry
│   │   │   ├── controllers/
│   │   │   │   └── productController.js
│   │   │   ├── routes/
│   │   │   │   └── products.js
│   │   │   └── cron.js           # Scheduled tasks
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── segment-service/          # Segment Service
│       ├── src/
│       │   ├── index.js          # Main entry
│       │   ├── controllers/
│       │   │   └── segmentController.js
│       │   ├── routes/
│       │   │   └── segments.js
│       │   └── utils/
│       │       ├── ruleParser.js # Rule parsing logic
│       │       └── __tests__/    # Unit tests
│       │           └── ruleParser.test.js
│       ├── jest.config.js
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/                   # Shared utilities
│       ├── models/
│       │   └── Product.js        # Product schema
│       ├── utils/
│       │   └── woocommerce.js    # WooCommerce API client
│       ├── database/
│       │   └── index.js          # MongoDB connection
│       ├── index.js              # Exports
│       └── package.json
│
├── docker-compose.yml            # Docker orchestration
├── package.json                  # Root workspace config
├── .gitignore
└── README.md
```

## 🔐 Security

### API Key Authentication

All gateway endpoints under `/api/*` require an `x-api-key` header:

```bash
curl -H "x-api-key: your-api-key" http://localhost:5000/api/products
```

### Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Scope**: All `/api/*` endpoints
- **Headers**: `RateLimit-*` headers included in responses

### CORS Configuration

- **Development**: `http://localhost:3000`
- **Production**: Configure `CORS_ORIGIN` environment variable

### Security Headers

- Helmet.js for HTTP security headers
- Content Security Policy
- XSS Protection
- HTTPS enforcement (production)

## 🚀 Deployment

### Deploy to Render

1. **Create services** on Render.com:

   - Web Service for each microservice
   - Static Site for frontend

2. **Configure environment variables** in Render dashboard

3. **Set build commands**:

   - **Product/Segment/Gateway**: `npm install`
   - **Frontend**: `npm install && npm run build`

4. **Set start commands**:
   - **Product/Segment/Gateway**: `npm start`
   - **Frontend**: `npm start`

### Deploy to Railway

1. **Create project** on Railway.app

2. **Add services** from GitHub repo

3. **Configure environment variables**

4. **Deploy** each service

### Environment Variables

#### Production Gateway

```env
NODE_ENV=production
PRODUCT_SERVICE_URL=https://product-service.onrender.com
SEGMENT_SERVICE_URL=https://segment-service.onrender.com
API_KEYS=prod-key-1,prod-key-2
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Production Frontend

```env
NEXT_PUBLIC_API_GATEWAY_URL=https://gateway.onrender.com
NEXT_PUBLIC_API_KEY=prod-key-1
```

## 🔧 Development

### Available Scripts

```bash
# Install all dependencies
npm install

# Development mode (specific service)
npm run dev:product-service
npm run dev:segment-service
npm run dev:gateway-service
npm run dev:app

# Production mode
npm run start:product-service
npm run start:segment-service
npm run start:gateway
npm run start:app

# Build frontend
npm run build:app

# Run tests
npm test

# Run tests with coverage
npm run test:coverage --workspace=segment-service

# Clean node_modules
npm run clean
```

### Code Style

- **ES Modules**: `import`/`export` syntax
- **Async/Await**: Modern async handling
- **Error Handling**: Try-catch with detailed messages
- **Logging**: Morgan for HTTP requests
- **Validation**: Input validation on all endpoints

## 📊 Database Schema

### Product Model

```javascript
{
  _id: Number,              // WooCommerce product ID
  title: String,            // Product name
  price: String,            // Product price
  stock_status: String,     // instock | outofstock | onbackorder
  stock_quantity: Number,   // Available quantity
  category: String,         // Primary category name
  tags: [String],           // Product tags
  on_sale: Boolean,         // Sale status
  createdAt: Date,          // Created timestamp
  updatedAt: Date           // Updated timestamp
}
```

## 📝 Sample Data

### Sample Segment Rules

**Budget Products**

```
price <= 50
stock_status = instock
```

**Premium Electronics on Sale**

```
price >= 500
price <= 2000
category = Electronics
on_sale = true
stock_quantity > 5
```

**Out of Stock Items**

```
stock_status = outofstock
```

**Low Inventory Alert**

```
stock_quantity > 0
stock_quantity <= 10
stock_status = instock
```
