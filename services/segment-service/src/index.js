import "dotenv/config";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { database } from "@woocommerce/shared";
import segmentRoutes from "./routes/segments.js";

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Segment Service API",
      version: "1.0.0",
      description: "API for product segmentation and rule evaluation",
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
            _id: {
              type: "integer",
              description: "WooCommerce product ID (used as primary key)",
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
app.use("/", segmentRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "segment-service",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Segment Service API",
    version: "1.0.0",
    docs: "/docs",
    endpoints: {
      "POST /segments/evaluate": "Evaluate products based on rules",
      "POST /segments/validate": "Validate rules without executing",
      "GET /segments/meta": "Get segmentation metadata",
      "GET /health": "Health check",
    },
    examples: {
      evaluate: {
        rules: "price > 100\nstock_status = instock",
        page: 1,
        limit: 50,
      },
      validate: {
        rules: "price > 100\nstock_status = instock",
      },
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

    app.listen(PORT, () => {
      console.log(`Segment Service running on port ${PORT}`);
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
