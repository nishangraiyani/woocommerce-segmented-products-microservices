import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import createProxyRoutes from "./routes/proxy.js";
import Cache from "./utils/cache.js";
import HealthChecker from "./utils/healthCheck.js";
import errorHandler from "./middleware/errorHandler.js";
import apiKeyAuth from "./middleware/apiKeyAuth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize cache
const cache = new Cache(parseInt(process.env.CACHE_TTL_SECONDS) || 300);

// Initialize health checker
const healthChecker = new HealthChecker();

// Register services for health monitoring
healthChecker.addService(
  "product-service",
  `${process.env.PRODUCT_SERVICE_URL || "http://localhost:5001"}/health`
);
healthChecker.addService(
  "segment-service",
  `${process.env.SEGMENT_SERVICE_URL || "http://localhost:5002"}/health`
);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API gateway
    crossOriginEmbedderPolicy: false,
  })
);

// CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-api-key",
    ],
  })
);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(limiter.windowMs / 1000),
      timestamp: new Date().toISOString(),
    });
  },
});

// Apply rate limiting to API routes
app.use("/api/", limiter);

// API Key Authentication - Apply to all /api routes
app.use("/api/", apiKeyAuth);

// Logging middleware
app.use(
  morgan("combined", {
    skip: (req, res) => process.env.NODE_ENV === "test",
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Create proxy routes
const { productProxy, segmentProxy } = createProxyRoutes();

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const healthStatus = await healthChecker.checkAllServices();

    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      service: "gateway-service",
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
      services: healthStatus.services,
      summary: healthStatus.summary,
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({
      success: false,
      service: "gateway-service",
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API Gateway Service",
    version: "1.0.0",
    authentication: {
      required: true,
      method: "x-api-key header",
      note: "All /api/* endpoints require a valid API key in the x-api-key header",
    },
    services: {
      "GET /health": "Health check for all services (no auth required)",
      "GET /api/products": "Product service endpoints (auth required)",
      "POST /api/segments": "Segment service endpoints (auth required)",
    },
    endpoints: {
      "GET /api/products": "Get all products (cached)",
      "POST /api/products/ingest": "Trigger product ingestion",
      "POST /api/segments/evaluate": "Evaluate products by rules",
      "POST /api/segments/validate": "Validate segmentation rules",
      "GET /api/segments/meta": "Get segmentation metadata",
    },
    status: "operational",
  });
});

// Cache middleware for product GET requests
app.use("/api/products", cache.middleware());

// Debug middleware to log all API requests
app.use("/api", (req, res, next) => {
  console.log(
    `[GATEWAY] Incoming ${req.method} request to: ${req.originalUrl}`
  );
  console.log(
    `[GATEWAY] Request body:`,
    req.body ? JSON.stringify(req.body).substring(0, 200) + "..." : "none"
  );
  next();
});

// Proxy routes
app.use("/api/products", productProxy);
app.use("/api/segments", segmentProxy);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    availableRoutes: [
      "GET /health",
      "GET /",
      "GET /api/products",
      "POST /api/products/ingest",
      "POST /api/segments/evaluate",
      "POST /api/segments/validate",
      "GET /api/segments/meta",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Gateway Service running on port ${PORT}`);
      console.log(
        `📊 Health check available at http://localhost:${PORT}/health`
      );
      console.log(
        `🔗 API endpoints available at http://localhost:${PORT}/api/*`
      );
      console.log(
        `⚡ Rate limiting: ${
          process.env.RATE_LIMIT_MAX_REQUESTS || 100
        } requests per ${Math.floor(
          (process.env.RATE_LIMIT_WINDOW_MS || 900000) / 60000
        )} minutes`
      );
      console.log(
        `💾 Cache TTL: ${process.env.CACHE_TTL_SECONDS || 300} seconds`
      );
    });
  } catch (error) {
    console.error("Failed to start Gateway Service:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down Gateway Service gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down Gateway Service gracefully");
  process.exit(0);
});

startServer();
