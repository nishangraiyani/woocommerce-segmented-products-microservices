import { Product, wooCommerceAPI } from "@woocommerce/shared";

class ProductController {
  // Core ingestion logic
  performIngestion = async () => {
    let page = 1;
    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;

    try {
      while (true) {
        console.log(`Fetching products page ${page}...`);

        const { products, totalPages } = await wooCommerceAPI.getProducts(
          page,
          100
        );

        if (products.length === 0) {
          break;
        }
        console.log("products[0]", products[0]);
        // Process products in batches
        const bulkOps = products.map((wcProduct) => {
          const productData = wooCommerceAPI.mapProductToSchema(wcProduct);

          return {
            updateOne: {
              filter: { _id: productData._id },
              update: {
                $set: productData,
              },
              upsert: true,
            },
          };
        });

        const result = await Product.bulkWrite(bulkOps);

        totalProcessed += products.length;
        totalCreated += result.upsertedCount;
        totalUpdated += result.modifiedCount;

        console.log(
          `Processed ${products.length} products (Created: ${result.upsertedCount}, Updated: ${result.modifiedCount})`
        );

        if (page >= totalPages) {
          break;
        }

        page++;
      }

      return {
        totalProcessed,
        totalCreated,
        totalUpdated,
      };
    } catch (error) {
      console.error("Ingestion failed:", error);
      throw error;
    }
  };
  // GET /products - Return all stored products
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;

      const products = await Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments();

      res.json({
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      });
    }
  }

  // POST /products/ingest - Manually trigger ingestion
  async ingestProducts(req, res) {
    try {
      const result = await this.performIngestion();

      res.json({
        success: true,
        message: "Product ingestion completed successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error during product ingestion:", error);
      res.status(500).json({
        success: false,
        message: "Failed to ingest products",
        error: error.message,
      });
    }
  }
}

export default new ProductController();
