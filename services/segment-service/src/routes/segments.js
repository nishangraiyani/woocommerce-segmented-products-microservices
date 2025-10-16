import express from "express";
import segmentController from "../controllers/segmentController.js";

const router = express.Router();

/**
 * @swagger
 * /evaluate:
 *   post:
 *     summary: Evaluate products based on text-based rules
 *     description: Parse and evaluate segmentation rules to filter products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rules
 *             properties:
 *               rules:
 *                 type: string
 *                 description: Multi-line text with conditions (one per line)
 *                 example: |
 *                   price > 100
 *                   stock_status = instock
 *                   on_sale = true
 *               page:
 *                 type: integer
 *                 default: 1
 *                 description: Page number for pagination
 *               limit:
 *                 type: integer
 *                 default: 50
 *                 description: Number of products per page
 *     responses:
 *       200:
 *         description: Successfully evaluated segments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     conditions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     query:
 *                       type: object
 *                       description: MongoDB query object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid rules or request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post("/evaluate", segmentController.evaluateSegments);

/**
 * @swagger
 * /validate:
 *   post:
 *     summary: Validate segmentation rules without executing query
 *     description: Parse and validate rules to check syntax and allowed fields
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rules
 *             properties:
 *               rules:
 *                 type: string
 *                 description: Multi-line text with conditions
 *                 example: |
 *                   price > 100
 *                   stock_status = instock
 *     responses:
 *       200:
 *         description: Rules are valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     conditions:
 *                       type: array
 *                     query:
 *                       type: object
 *                     valid:
 *                       type: boolean
 *       400:
 *         description: Invalid rules
 */
router.post("/validate", segmentController.validateRules);

/**
 * @swagger
 * /meta:
 *   get:
 *     summary: Get segmentation metadata
 *     description: Retrieve information about allowed fields, operators, and examples
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     allowedFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                     allowedOperators:
 *                       type: array
 *                       items:
 *                         type: string
 *                     fieldTypes:
 *                       type: object
 *                     examples:
 *                       type: object
 */
router.get("/meta", segmentController.getMetadata);

export default router;
