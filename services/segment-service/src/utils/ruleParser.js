/**
 * Rule Parser for Segment Service
 * Parses text-based conditions into MongoDB query objects
 */

// Allowed fields for segmentation
const ALLOWED_FIELDS = new Set([
  "title",
  "price",
  "stock_status",
  "stock_quantity",
  "category",
  "tags",
  "on_sale",
]);

// Allowed operators
const ALLOWED_OPERATORS = new Set(["=", ">", "<", ">=", "<=", "!="]);

// Field type mappings for proper query construction
const FIELD_TYPES = {
  id: "number",
  stock_quantity: "number",
  on_sale: "boolean",
};

class RuleParser {
  /**
   * Parse a single rule condition
   * @param {string} condition - e.g., "price > 1000" or "stock_status = instock"
   * @returns {object} Parsed condition object
   */
  parseCondition(condition) {
    try {
      const trimmed = condition.trim();

      if (!trimmed) {
        throw new Error("Empty condition");
      }

      // Find the operator
      let operator = null;
      let operatorIndex = -1;

      // Check operators in order of length (longest first to avoid conflicts)
      const operators = [">=", "<=", "!=", "=", ">", "<"];
      for (const op of operators) {
        const index = trimmed.indexOf(op);
        if (index > 0) {
          // Must not be at the beginning
          operator = op;
          operatorIndex = index;
          break;
        }
      }

      if (!operator) {
        throw new Error(`No valid operator found in condition: ${trimmed}`);
      }

      const field = trimmed.substring(0, operatorIndex).trim();
      const value = trimmed.substring(operatorIndex + operator.length).trim();

      if (!field) {
        throw new Error(`No field specified in condition: ${trimmed}`);
      }

      if (!value) {
        throw new Error(`No value specified in condition: ${trimmed}`);
      }

      return {
        field,
        operator,
        value,
        original: trimmed,
      };
    } catch (error) {
      throw new Error(`Invalid condition "${condition}": ${error.message}`);
    }
  }

  /**
   * Parse multiple conditions from text input
   * @param {string} ruleText - Multi-line text with conditions
   * @returns {Array} Array of parsed conditions
   */
  parseRuleText(ruleText) {
    if (!ruleText || typeof ruleText !== "string") {
      throw new Error("Rule text must be a non-empty string");
    }

    const lines = ruleText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    if (lines.length === 0) {
      throw new Error("No valid conditions found in rule text");
    }

    const conditions = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      try {
        const condition = this.parseCondition(lines[i]);
        conditions.push(condition);
      } catch (error) {
        errors.push({
          line: i + 1,
          condition: lines[i],
          error: error.message,
        });
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Rule parsing errors:\n${errors
          .map((e) => `Line ${e.line}: ${e.error} (${e.condition})`)
          .join("\n")}`
      );
    }

    return conditions;
  }

  /**
   * Validate a parsed condition
   * @param {object} condition - Parsed condition object
   */
  validateCondition(condition) {
    const { field, operator, value } = condition;

    // Check field
    if (!ALLOWED_FIELDS.has(field)) {
      throw new Error(
        `Field "${field}" is not allowed. Allowed fields: ${Array.from(
          ALLOWED_FIELDS
        ).join(", ")}`
      );
    }

    // Check operator
    if (!ALLOWED_OPERATORS.has(operator)) {
      throw new Error(
        `Operator "${operator}" is not allowed. Allowed operators: ${Array.from(
          ALLOWED_OPERATORS
        ).join(", ")}`
      );
    }

    // Validate value based on field type
    this.validateValue(field, value);
  }

  /**
   * Validate value based on field type
   * @param {string} field - Field name
   * @param {string} value - Value to validate
   */
  validateValue(field, value) {
    const fieldType = FIELD_TYPES[field];

    switch (fieldType) {
      case "number":
        if (isNaN(Number(value))) {
          throw new Error(
            `Field "${field}" requires a numeric value, got: ${value}`
          );
        }
        break;

      case "boolean":
        const lowerValue = value.toLowerCase();
        if (lowerValue !== "true" && lowerValue !== "false") {
          throw new Error(
            `Field "${field}" requires a boolean value (true/false), got: ${value}`
          );
        }
        break;

      case "date":
        // For date fields, we'll accept ISO strings and validate during query conversion
        break;

      default:
        // String fields - no specific validation needed
        break;
    }
  }

  /**
   * Convert parsed conditions to MongoDB query
   * @param {Array} conditions - Array of parsed conditions
   * @returns {object} MongoDB query object
   */
  buildMongoQuery(conditions) {
    if (!conditions || conditions.length === 0) {
      throw new Error("No conditions provided for query building");
    }

    const query = {};

    for (const condition of conditions) {
      this.validateCondition(condition);
      const mongoCondition = this.convertConditionToMongo(condition);

      // For multiple conditions on the same field, combine them with $and
      if (query[condition.field]) {
        if (!query.$and) {
          query.$and = [
            { [condition.field]: query[condition.field] },
            { [condition.field]: mongoCondition },
          ];
          delete query[condition.field];
        } else {
          query.$and.push({ [condition.field]: mongoCondition });
        }
      } else {
        query[condition.field] = mongoCondition;
      }
    }

    return query;
  }

  /**
   * Convert a single condition to MongoDB query format
   * @param {object} condition - Parsed condition
   * @returns {object} MongoDB condition object
   */
  convertConditionToMongo(condition) {
    const { field, operator, value } = condition;
    const fieldType = FIELD_TYPES[field];

    // Convert value based on field type
    let processedValue = value;
    if (fieldType === "number") {
      processedValue = Number(value);
    } else if (fieldType === "boolean") {
      processedValue = value.toLowerCase() === "true";
    }

    // Convert operator to MongoDB operator
    switch (operator) {
      case "=":
        return processedValue;
      case "!=":
        return { $ne: processedValue };
      case ">":
        return { $gt: processedValue };
      case "<":
        return { $lt: processedValue };
      case ">=":
        return { $gte: processedValue };
      case "<=":
        return { $lte: processedValue };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}

export default new RuleParser();
