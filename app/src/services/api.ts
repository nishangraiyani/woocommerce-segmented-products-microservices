import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:5000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
  timeout: 30000,
});

export interface Product {
  _id: number;
  title: string;
  price: string;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  category: string | null;
  tags: string[];
  on_sale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentEvaluationRequest {
  rules: string;
  page?: number;
  limit?: number;
}

export interface SegmentEvaluationResponse {
  success: boolean;
  data: {
    products: Product[];
    conditions: Array<{
      field: string;
      operator: string;
      value: string;
      original: string;
    }>;
    query: Record<string, any>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message: string;
}

export interface SegmentValidationResponse {
  success: boolean;
  data: {
    conditions: Array<{
      field: string;
      operator: string;
      value: string;
      original: string;
    }>;
    query: Record<string, any>;
    valid: boolean;
  };
  message: string;
}

export interface SegmentMetadata {
  success: boolean;
  data: {
    allowedFields: string[];
    allowedOperators: string[];
    fieldTypes: Record<string, string>;
    examples: {
      basic: string;
      complex: string;
      date: string;
    };
  };
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Functions
export const productApi = {
  async getAll(
    page: number = 1,
    limit: number = 50
  ): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>("/api/products", {
      params: { page, limit },
    });
    return response.data;
  },

  async triggerIngestion(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post("/api/products/ingest");
    return response.data;
  },
};

export const segmentApi = {
  async evaluate(
    request: SegmentEvaluationRequest
  ): Promise<SegmentEvaluationResponse> {
    const response = await apiClient.post<SegmentEvaluationResponse>(
      "/api/segments/evaluate",
      request
    );
    return response.data;
  },

  async validate(rules: string): Promise<SegmentValidationResponse> {
    const response = await apiClient.post<SegmentValidationResponse>(
      "/api/segments/validate",
      { rules }
    );
    return response.data;
  },

  async getMetadata(): Promise<SegmentMetadata> {
    const response = await apiClient.get<SegmentMetadata>("/api/segments/meta");
    return response.data;
  },
};

export default apiClient;
