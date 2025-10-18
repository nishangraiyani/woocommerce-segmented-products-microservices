/**
 * Jest Configuration for Segment Service
 * Configured for ES Modules support
 */

export default {
  // Use Node's test environment
  testEnvironment: "node",

  // Transform ES modules - empty object for native ES modules
  transform: {},

  // Module name mapper for local modules
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // File extensions to consider
  moduleFileExtensions: ["js", "json"],

  // Test file patterns
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/__tests__/**",
    "!src/index.js", // Exclude entry point from coverage
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Restore mocks between tests
  restoreMocks: true,
};
