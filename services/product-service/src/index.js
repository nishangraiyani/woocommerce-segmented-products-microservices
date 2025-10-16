import "dotenv/config";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { database } from "@woocommerce/shared";
import productRoutes from "./routes/products.js";
import scheduleCronJob from "./cron.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product Service API",
      version: "1.0.0",
      description:
        "API for managing WooCommerce products ingestion and retrieval",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "WooCommerce product ID",
              example: 123,
            },
            title: {
              type: "string",
              description: "Product title",
              example: "Sample Product",
            },
            price: {
              type: "string",
              description: "Product price",
              example: "29.99",
            },
            stock_status: {
              type: "string",
              enum: ["instock", "outofstock", "onbackorder"],
              description: "Stock status",
              example: "instock",
            },
            stock_quantity: {
              type: "integer",
              nullable: true,
              description: "Stock quantity",
              example: 100,
            },
            category: {
              type: "string",
              nullable: true,
              description: "First category name",
              example: "Electronics",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of tag names",
              example: ["tag1", "tag2"],
            },
            on_sale: {
              type: "boolean",
              description: "Whether product is on sale",
              example: false,
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Creation date (ISO string)",
              example: "2023-01-01T00:00:00.000Z",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/", productRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "product-service",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Product Service API",
    version: "1.0.0",
    docs: "/docs",
    endpoints: {
      "GET /products": "Get all products",
      "POST /products/ingest": "Trigger manual product ingestion",
      "GET /health": "Health check",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/product-service";
    await database.connect(mongoURI);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    scheduleCronJob();

    app.listen(PORT, () => {
      console.log(`Product Service running on port ${PORT}`);
      console.log(
        `API Documentation available at http://localhost:${PORT}/docs`
      );
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await database.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await database.disconnect();
  process.exit(0);
});

startServer();
