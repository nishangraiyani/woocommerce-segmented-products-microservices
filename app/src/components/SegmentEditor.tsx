"use client";

import { useState } from "react";
import { segmentApi, SegmentEvaluationResponse } from "@/services/api";

interface SegmentEditorProps {
  onEvaluate: (result: SegmentEvaluationResponse, rules: string) => void;
  onReset: () => void;
  currentPage?: number;
  itemsPerPage?: number;
}

export default function SegmentEditor({
  onEvaluate,
  onReset,
  currentPage = 1,
  itemsPerPage = 20,
}: SegmentEditorProps) {
  const [rules, setRules] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const [savedRules, setSavedRules] = useState(""); // Store rules for pagination

  const placeholderText = `Enter your segmentation rules (one per line):

Examples:
price > 100
stock_status = instock
on_sale = true
stock_quantity >= 10

Supported operators: =, !=, >, <, >=, <=
Supported fields: id, title, price, stock_status, stock_quantity, category, tags, on_sale`;

  const handleEvaluate = async () => {
    if (!rules.trim()) {
      setError("Please enter at least one rule");
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidationMessage(null);

    try {
      const result = await segmentApi.evaluate({
        rules: rules.trim(),
        page: currentPage,
        limit: itemsPerPage,
      });

      if (result.success) {
        setValidationMessage(result.message);
        setSavedRules(rules.trim()); // Save rules for potential pagination
        onEvaluate(result, rules.trim());
      } else {
        setError("Failed to evaluate segments");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to evaluate segments";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRules("");
    setError(null);
    setValidationMessage(null);
    onReset();
  };

  const handleValidate = async () => {
    if (!rules.trim()) {
      setError("Please enter at least one rule");
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidationMessage(null);

    try {
      const result = await segmentApi.validate(rules.trim());
      if (result.success && result.data.valid) {
        setValidationMessage(
          `✓ Rules are valid! Found ${result.data.conditions.length} condition(s)`
        );
      } else {
        setError("Rules validation failed");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Validation failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Product Segment Editor
      </h2>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Quick Guide:
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Each rule should be on a separate line</li>
          <li>
            • Use operators: = (equal), != (not equal), &gt; (greater than),
            &lt; (less than), &gt;= (greater or equal), &lt;= (less or equal)
          </li>
          <li>• String values don't need quotes: stock_status = instock</li>
          <li>• Boolean values: on_sale = true or on_sale = false</li>
          <li>• Numeric values: price &gt; 100 or stock_quantity &gt;= 10</li>
        </ul>
      </div>
      <div className="mb-4">
        <label
          htmlFor="rules"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Segmentation Rules
        </label>
        <textarea
          id="rules"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder={placeholderText}
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm text-black .placeholder-black::placeholder"
          disabled={isLoading}
        />
      </div>
      {validationMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{validationMessage}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleEvaluate}
          disabled={isLoading || !rules.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Evaluating...
            </span>
          ) : (
            "Evaluate"
          )}
        </button>

        <button
          onClick={handleValidate}
          disabled={isLoading || !rules.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          Validate
        </button>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
