/**
 * Unit Tests for Rule Parser
 * Tests various scenarios for parsing text-based rules into MongoDB queries
 */

import ruleParser from "../ruleParser.js";

describe("RuleParser - parseCondition", () => {
  describe("Valid conditions", () => {
    test("should parse simple equality condition", () => {
      const result = ruleParser.parseCondition("stock_status = instock");
      expect(result).toEqual({
        field: "stock_status",
        operator: "=",
        value: "instock",
        original: "stock_status = instock",
      });
    });

    test("should parse greater than condition", () => {
      const result = ruleParser.parseCondition("price > 100");
      expect(result).toEqual({
        field: "price",
        operator: ">",
        value: "100",
        original: "price > 100",
      });
    });

    test("should parse less than condition", () => {
      const result = ruleParser.parseCondition("stock_quantity < 50");
      expect(result).toEqual({
        field: "stock_quantity",
        operator: "<",
        value: "50",
        original: "stock_quantity < 50",
      });
    });

    test("should parse greater than or equal condition", () => {
      const result = ruleParser.parseCondition("price >= 500");
      expect(result).toEqual({
        field: "price",
        operator: ">=",
        value: "500",
        original: "price >= 500",
      });
    });

    test("should parse less than or equal condition", () => {
      const result = ruleParser.parseCondition("stock_quantity <= 100");
      expect(result).toEqual({
        field: "stock_quantity",
        operator: "<=",
        value: "100",
        original: "stock_quantity <= 100",
      });
    });

    test("should parse not equal condition", () => {
      const result = ruleParser.parseCondition("stock_status != outofstock");
      expect(result).toEqual({
        field: "stock_status",
        operator: "!=",
        value: "outofstock",
        original: "stock_status != outofstock",
      });
    });

    test("should parse boolean true condition", () => {
      const result = ruleParser.parseCondition("on_sale = true");
      expect(result).toEqual({
        field: "on_sale",
        operator: "=",
        value: "true",
        original: "on_sale = true",
      });
    });

    test("should parse boolean false condition", () => {
      const result = ruleParser.parseCondition("on_sale = false");
      expect(result).toEqual({
        field: "on_sale",
        operator: "=",
        value: "false",
        original: "on_sale = false",
      });
    });

    test("should handle extra whitespace", () => {
      const result = ruleParser.parseCondition("  price   >   1000  ");
      expect(result).toEqual({
        field: "price",
        operator: ">",
        value: "1000",
        original: "price   >   1000",
      });
    });

    test("should parse string values with spaces", () => {
      const result = ruleParser.parseCondition("category = Electronics");
      expect(result).toEqual({
        field: "category",
        operator: "=",
        value: "Electronics",
        original: "category = Electronics",
      });
    });
  });

  describe("Invalid conditions", () => {
    test("should throw error for empty condition", () => {
      expect(() => ruleParser.parseCondition("")).toThrow("Empty condition");
    });

    test("should throw error for whitespace only", () => {
      expect(() => ruleParser.parseCondition("   ")).toThrow("Empty condition");
    });

    test("should throw error for missing operator", () => {
      expect(() => ruleParser.parseCondition("price 100")).toThrow(
        "No valid operator found"
      );
    });

    test("should throw error for missing field", () => {
      expect(() => ruleParser.parseCondition("= 100")).toThrow(
        "No valid operator found"
      );
    });

    test("should throw error for invalid field", () => {
      expect(() => ruleParser.parseCondition(" < 100")).toThrow(
        "No field specified"
      );
    });

    test("should throw error for missing value", () => {
      expect(() => ruleParser.parseCondition("price >")).toThrow(
        "No value specified"
      );
    });

    test("should throw error for operator at start", () => {
      expect(() => ruleParser.parseCondition("> 100")).toThrow(
        "No valid operator found"
      );
    });
  });
});

describe("RuleParser - parseRuleText", () => {
  describe("Valid rule texts", () => {
    test("should parse single line rule", () => {
      const rules = ruleParser.parseRuleText("price > 100");
      expect(rules).toHaveLength(1);
      expect(rules[0].field).toBe("price");
      expect(rules[0].operator).toBe(">");
      expect(rules[0].value).toBe("100");
    });

    test("should parse multiple line rules", () => {
      const ruleText = `price > 100
stock_status = instock
on_sale = true`;

      const rules = ruleParser.parseRuleText(ruleText);
      expect(rules).toHaveLength(3);
      expect(rules[0].field).toBe("price");
      expect(rules[1].field).toBe("stock_status");
      expect(rules[2].field).toBe("on_sale");
    });

    test("should ignore empty lines", () => {
      const ruleText = `price > 100

stock_status = instock

on_sale = true`;

      const rules = ruleParser.parseRuleText(ruleText);
      expect(rules).toHaveLength(3);
    });

    test("should ignore comment lines starting with #", () => {
      const ruleText = `# This is a comment
price > 100
# Another comment
stock_status = instock`;

      const rules = ruleParser.parseRuleText(ruleText);
      expect(rules).toHaveLength(2);
      expect(rules[0].field).toBe("price");
      expect(rules[1].field).toBe("stock_status");
    });

    test("should handle mixed whitespace and comments", () => {
      const ruleText = `
# Filter expensive in-stock products
price > 500

stock_status = instock
  # End of rules
`;

      const rules = ruleParser.parseRuleText(ruleText);
      expect(rules).toHaveLength(2);
    });

    test("should parse complex multi-condition rules", () => {
      const ruleText = `price >= 100
price <= 500
stock_status = instock
stock_quantity > 10
on_sale = true
category = Electronics`;

      const rules = ruleParser.parseRuleText(ruleText);
      expect(rules).toHaveLength(6);
    });
  });

  describe("Invalid rule texts", () => {
    test("should throw error for null input", () => {
      expect(() => ruleParser.parseRuleText(null)).toThrow(
        "Rule text must be a non-empty string"
      );
    });

    test("should throw error for undefined input", () => {
      expect(() => ruleParser.parseRuleText(undefined)).toThrow(
        "Rule text must be a non-empty string"
      );
    });

    test("should throw error for non-string input", () => {
      expect(() => ruleParser.parseRuleText(123)).toThrow(
        "Rule text must be a non-empty string"
      );
    });

    test("should throw error for empty string", () => {
      expect(() => ruleParser.parseRuleText("")).toThrow(
        "Rule text must be a non-empty string"
      );
    });

    test("should throw error for only comments and whitespace", () => {
      expect(() =>
        ruleParser.parseRuleText("# Comment only\n\n  # Another comment")
      ).toThrow("No valid conditions found");
    });

    test("should collect errors from multiple invalid lines", () => {
      const ruleText = `price > 100
invalid line without operator
stock_status =`;

      expect(() => ruleParser.parseRuleText(ruleText)).toThrow(
        "Rule parsing errors"
      );
    });
  });
});

describe("RuleParser - validateCondition", () => {
  describe("Field validation", () => {
    test("should accept valid fields", () => {
      const validFieldsWithValues = [
        { field: "title", value: "Product" },
        { field: "price", value: "100" },
        { field: "stock_status", value: "instock" },
        { field: "stock_quantity", value: "50" },
        { field: "category", value: "Electronics" },
        { field: "tags", value: "tag1" },
        { field: "on_sale", value: "true" },
      ];

      validFieldsWithValues.forEach(({ field, value }) => {
        expect(() =>
          ruleParser.validateCondition({
            field,
            operator: "=",
            value,
          })
        ).not.toThrow();
      });
    });

    test("should reject invalid fields", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "invalid_field",
          operator: "=",
          value: "test",
        })
      ).toThrow('Field "invalid_field" is not allowed');
    });

    test("should reject SQL injection attempts", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "price; DROP TABLE products;",
          operator: "=",
          value: "100",
        })
      ).toThrow("not allowed");
    });
  });

  describe("Operator validation", () => {
    test("should accept valid operators", () => {
      const validOperators = ["=", ">", "<", ">=", "<=", "!="];

      validOperators.forEach((operator) => {
        expect(() =>
          ruleParser.validateCondition({
            field: "price",
            operator,
            value: "100",
          })
        ).not.toThrow();
      });
    });

    test("should reject invalid operators", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "price",
          operator: "===",
          value: "100",
        })
      ).toThrow('Operator "===" is not allowed');
    });
  });

  describe("Value validation", () => {
    test("should validate numeric fields with numeric values", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "stock_quantity",
          operator: ">",
          value: "100",
        })
      ).not.toThrow();
    });

    test("should reject non-numeric values for numeric fields", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "stock_quantity",
          operator: ">",
          value: "abc",
        })
      ).toThrow("requires a numeric value");
    });

    test("should validate boolean fields with true/false", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "on_sale",
          operator: "=",
          value: "true",
        })
      ).not.toThrow();

      expect(() =>
        ruleParser.validateCondition({
          field: "on_sale",
          operator: "=",
          value: "false",
        })
      ).not.toThrow();
    });

    test("should accept case-insensitive boolean values", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "on_sale",
          operator: "=",
          value: "TRUE",
        })
      ).not.toThrow();

      expect(() =>
        ruleParser.validateCondition({
          field: "on_sale",
          operator: "=",
          value: "False",
        })
      ).not.toThrow();
    });

    test("should reject invalid boolean values", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "on_sale",
          operator: "=",
          value: "yes",
        })
      ).toThrow("requires a boolean value");
    });

    test("should accept any string for string fields", () => {
      expect(() =>
        ruleParser.validateCondition({
          field: "category",
          operator: "=",
          value: "Electronics & Gadgets",
        })
      ).not.toThrow();
    });
  });
});

describe("RuleParser - buildMongoQuery", () => {
  describe("Single condition queries", () => {
    test("should build query for equality condition", () => {
      const conditions = [
        {
          field: "stock_status",
          operator: "=",
          value: "instock",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        stock_status: "instock",
      });
    });

    test("should build query for greater than condition", () => {
      const conditions = [
        {
          field: "price",
          operator: ">",
          value: "100",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        price: { $gt: "100" },
      });
    });

    test("should build query for less than condition", () => {
      const conditions = [
        {
          field: "stock_quantity",
          operator: "<",
          value: "50",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        stock_quantity: { $lt: 50 },
      });
    });

    test("should build query for not equal condition", () => {
      const conditions = [
        {
          field: "stock_status",
          operator: "!=",
          value: "outofstock",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        stock_status: { $ne: "outofstock" },
      });
    });

    test("should convert numeric values", () => {
      const conditions = [
        {
          field: "stock_quantity",
          operator: ">=",
          value: "100",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        stock_quantity: { $gte: 100 },
      });
    });

    test("should convert boolean values", () => {
      const conditions = [
        {
          field: "on_sale",
          operator: "=",
          value: "true",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        on_sale: true,
      });
    });
  });

  describe("Multiple condition queries", () => {
    test("should build AND query for multiple different fields", () => {
      const conditions = [
        { field: "price", operator: ">", value: "100" },
        { field: "stock_status", operator: "=", value: "instock" },
        { field: "on_sale", operator: "=", value: "true" },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        price: { $gt: "100" },
        stock_status: "instock",
        on_sale: true,
      });
    });

    test("should handle range queries on same field", () => {
      const conditions = [
        { field: "price", operator: ">=", value: "100" },
        { field: "price", operator: "<=", value: "500" },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        $and: [{ price: { $gte: "100" } }, { price: { $lte: "500" } }],
      });
    });

    test("should combine multiple conditions on same field with $and", () => {
      const conditions = [
        { field: "stock_quantity", operator: ">", value: "10" },
        { field: "stock_quantity", operator: "<", value: "100" },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query.$and).toBeDefined();
      expect(query.$and).toHaveLength(2);
      expect(query.$and[0]).toEqual({ stock_quantity: { $gt: 10 } });
      expect(query.$and[1]).toEqual({ stock_quantity: { $lt: 100 } });
    });

    test("should create $and condition", () => {
      const conditions = [
        { field: "price", operator: ">=", value: "100" },
        { field: "price", operator: ">=", value: "500" },
        { field: "price", operator: ">=", value: "800" },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query.$and).toBeDefined();
      expect(query.$and).toHaveLength(3);
      expect(query.$and[0]).toEqual({ price: { $gte: "100" } });
      expect(query.$and[1]).toEqual({ price: { $gte: "500" } });
      expect(query.$and[2]).toEqual({ price: { $gte: "800" } });
    });

    test("should build complex query with mixed conditions", () => {
      const conditions = [
        { field: "price", operator: ">=", value: "100" },
        { field: "price", operator: "<=", value: "500" },
        { field: "stock_status", operator: "=", value: "instock" },
        { field: "on_sale", operator: "=", value: "true" },
        { field: "stock_quantity", operator: ">", value: "0" },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query.stock_status).toBe("instock");
      expect(query.on_sale).toBe(true);
      expect(query.stock_quantity).toEqual({ $gt: 0 });
      expect(query.$and).toBeDefined();
      expect(query.$and).toHaveLength(2);
    });
  });

  describe("Edge cases", () => {
    test("should throw error for empty conditions array", () => {
      expect(() => ruleParser.buildMongoQuery([])).toThrow(
        "No conditions provided"
      );
    });

    test("should throw error for null conditions", () => {
      expect(() => ruleParser.buildMongoQuery(null)).toThrow(
        "No conditions provided"
      );
    });

    test("should handle zero as a valid value", () => {
      const conditions = [
        {
          field: "stock_quantity",
          operator: "=",
          value: "0",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        stock_quantity: 0,
      });
    });

    test("should handle negative numbers", () => {
      const conditions = [
        {
          field: "stock_quantity",
          operator: ">",
          value: "-10",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        stock_quantity: { $gt: -10 },
      });
    });

    test("should handle decimal numbers", () => {
      const conditions = [
        {
          field: "stock_quantity",
          operator: ">=",
          value: "10.5",
        },
      ];

      const query = ruleParser.buildMongoQuery(conditions);
      expect(query).toEqual({
        stock_quantity: { $gte: 10.5 },
      });
    });
  });
});

describe("RuleParser - End-to-End Integration", () => {
  test("should parse and build query for simple rule", () => {
    const ruleText = "price > 100";
    const conditions = ruleParser.parseRuleText(ruleText);
    const query = ruleParser.buildMongoQuery(conditions);

    expect(query).toEqual({
      price: { $gt: "100" },
    });
  });

  test("should parse and build query for multiple rules", () => {
    const ruleText = `price > 100
stock_status = instock
on_sale = true`;

    const conditions = ruleParser.parseRuleText(ruleText);
    const query = ruleParser.buildMongoQuery(conditions);

    expect(query).toEqual({
      price: { $gt: "100" },
      stock_status: "instock",
      on_sale: true,
    });
  });

  test("should parse and build query with range conditions", () => {
    const ruleText = `price >= 100
price <= 500
stock_status = instock`;

    const conditions = ruleParser.parseRuleText(ruleText);
    const query = ruleParser.buildMongoQuery(conditions);

    expect(query.stock_status).toBe("instock");
    expect(query.$and).toBeDefined();
    expect(query.$and).toHaveLength(2);
  });

  test("should handle complex real-world scenario", () => {
    const ruleText = `# Find premium in-stock products on sale
price >= 500
price <= 2000
stock_status = instock
stock_quantity > 5
on_sale = true
category = Electronics`;

    const conditions = ruleParser.parseRuleText(ruleText);
    const query = ruleParser.buildMongoQuery(conditions);

    expect(query.stock_status).toBe("instock");
    expect(query.on_sale).toBe(true);
    expect(query.category).toBe("Electronics");
    expect(query.stock_quantity).toEqual({ $gt: 5 });
    expect(query.$and).toBeDefined();
  });

  test("should reject invalid field in complete flow", () => {
    const ruleText = "invalid_field > 100";
    const conditions = ruleParser.parseRuleText(ruleText);

    expect(() => ruleParser.buildMongoQuery(conditions)).toThrow("not allowed");
  });

  test("should reject invalid value type in complete flow", () => {
    const ruleText = "stock_quantity > abc";
    const conditions = ruleParser.parseRuleText(ruleText);

    expect(() => ruleParser.buildMongoQuery(conditions)).toThrow(
      "requires a numeric value"
    );
  });
});

describe("RuleParser - Internal Method Tests", () => {
  test("should throw error for unsupported operator in convertConditionToMongo", () => {
    const condition = {
      field: "price",
      operator: "~=",
      value: "100",
    };

    expect(() => ruleParser.convertConditionToMongo(condition)).toThrow(
      "Unsupported operator: ~="
    );
  });
});

describe("RuleParser - Security Tests", () => {
  test("should prevent MongoDB injection attempts", () => {
    const maliciousConditions = [
      {
        field: "price",
        operator: "=",
        value: '{ "$gt": 0 }',
      },
    ];

    const query = ruleParser.buildMongoQuery(maliciousConditions);

    expect(query.price).toBe('{ "$gt": 0 }');
  });

  test("should sanitize field names", () => {
    expect(() =>
      ruleParser.validateCondition({
        field: "$where",
        operator: "=",
        value: "function() { return true; }",
      })
    ).toThrow("not allowed");
  });

  test("should reject NoSQL injection in field names", () => {
    expect(() =>
      ruleParser.validateCondition({
        field: "price[$gt]",
        operator: "=",
        value: "0",
      })
    ).toThrow("not allowed");
  });

  test("should handle special characters in values safely", () => {
    const conditions = [
      {
        field: "category",
        operator: "=",
        value: "Electronics & Gadgets (New!)",
      },
    ];

    const query = ruleParser.buildMongoQuery(conditions);
    expect(query.category).toBe("Electronics & Gadgets (New!)");
  });
});
