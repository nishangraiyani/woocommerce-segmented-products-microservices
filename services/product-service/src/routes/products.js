import express from "express";
import productController from "../controllers/productController.js";

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a paginated list of all stored products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get("/", productController.getProducts.bind(productController));

/**
 * @swagger
 * /products/ingest:
 *   post:
 *     summary: Trigger manual product ingestion
 *     description: Manually trigger the ingestion process to fetch and store products from WooCommerce
 *     responses:
 *       200:
 *         description: Ingestion completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product ingestion completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProcessed:
 *                       type: integer
 *                     totalCreated:
 *                       type: integer
 *                     totalUpdated:
 *                       type: integer
 *       500:
 *         description: Ingestion failed
 */
router.post(
  "/ingest",
  productController.ingestProducts.bind(productController)
);

export default router;
