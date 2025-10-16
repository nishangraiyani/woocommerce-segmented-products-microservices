import { Product } from "@woocommerce/shared";
import ruleParser from "../utils/ruleParser.js";

/**
 * Segment Controller
 * Handles product segmentation and rule evaluation
 */
class SegmentController {
  /**
   * Evaluate segments based on text rules
   * POST /segments/evaluate
   */
  async evaluateSegments(req, res) {
    try {
      const { rules, page = 1, limit = 50 } = req.body;

      if (!rules || typeof rules !== "string") {
        return res.status(400).json({
          success: false,
          message: "Rules must be provided as a string",
          example: {
            rules: "price > 100\nstock_status = instock",
            page: 1,
            limit: 50,
          },
        });
      }

      // Parse rules
      const conditions = ruleParser.parseRuleText(rules);

      // Build MongoDB query
      const query = ruleParser.buildMongoQuery(conditions);

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      res.json({
        success: true,
        data: {
          products,
          conditions,
          query,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
        message: `Found ${total} products matching ${conditions.length} conditions`,
      });
    } catch (error) {
      console.error("Error evaluating segments:", error);
      res.status(400).json({
        success: false,
        message: "Failed to evaluate segments",
        error: error.message,
        example: {
          rules: "price > 100\nstock_status = instock",
          page: 1,
          limit: 50,
        },
      });
    }
  }

  /**
   * Validate rules without executing query
   * POST /segments/validate
   */
  async validateRules(req, res) {
    try {
      const { rules } = req.body;

      if (!rules || typeof rules !== "string") {
        return res.status(400).json({
          success: false,
          message: "Rules must be provided as a string",
          example: {
            rules: "price > 100\nstock_status = instock",
          },
        });
      }

      // Parse and validate rules
      const conditions = ruleParser.parseRuleText(rules);

      // Build query to validate structure
      const query = ruleParser.buildMongoQuery(conditions);

      res.json({
        success: true,
        data: {
          conditions,
          query,
          valid: true,
        },
        message: `Rules are valid. Found ${conditions.length} conditions.`,
      });
    } catch (error) {
      console.error("Error validating rules:", error);
      res.status(400).json({
        success: false,
        message: "Rule validation failed",
        error: error.message,
        valid: false,
      });
    }
  }

  /**
   * Get available fields and operators
   * GET /segments/meta
   */
  async getMetadata(req, res) {
    res.json({
      success: true,
      data: {
        allowedFields: [
          "id",
          "title",
          "price",
          "stock_status",
          "stock_quantity",
          "category",
          "tags",
          "on_sale",
        ],
        allowedOperators: ["=", ">", "<", ">=", "<=", "!="],
        fieldTypes: {
          id: "number",
          stock_quantity: "number",
          on_sale: "boolean",
          title: "string",
          price: "string",
          stock_status: "string",
          category: "string",
          tags: "array",
        },
        examples: {
          basic: "price > 100\nstock_status = instock",
          complex:
            "price >= 50\nprice <= 500\nstock_status = instock\non_sale = true",
        },
      },
    });
  }
}

export default new SegmentController();
