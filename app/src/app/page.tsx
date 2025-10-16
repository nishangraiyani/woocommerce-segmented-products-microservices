"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import SegmentEditor from "@/components/SegmentEditor";
import Pagination from "@/components/Pagination";
import {
  Product,
  productApi,
  SegmentEvaluationResponse,
  segmentApi,
  ProductListResponse,
} from "@/services/api";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [segmentInfo, setSegmentInfo] = useState<string | null>(null);
  const [currentRules, setCurrentRules] = useState<string>(""); // Store current rules for pagination

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Fetch all products on initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productApi.getAll(page, pagination.itemsPerPage);
      setProducts(response.data);
      setFilteredProducts(response.data);

      // Update pagination for all products view
      if (!isFiltered) {
        setPagination({
          currentPage: response.pagination.page,
          totalPages: response.pagination.pages,
          totalItems: response.pagination.total,
          itemsPerPage: response.pagination.limit,
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch products"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluate = (result: SegmentEvaluationResponse, rules: string) => {
    setFilteredProducts(result.data.products);
    setIsFiltered(true);
    setSegmentInfo(result.message);
    setCurrentRules(rules); // Store rules for pagination

    // Update pagination from API response
    setPagination({
      currentPage: result.data.pagination.page,
      totalPages: result.data.pagination.pages,
      totalItems: result.data.pagination.total,
      itemsPerPage: result.data.pagination.limit,
    });
  };

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isFiltered && currentRules) {
        // Handle pagination for filtered results
        const result = await segmentApi.evaluate({
          rules: currentRules,
          page: newPage,
          limit: pagination.itemsPerPage,
        });

        if (result.success) {
          setFilteredProducts(result.data.products);
          setSegmentInfo(result.message);

          setPagination({
            currentPage: result.data.pagination.page,
            totalPages: result.data.pagination.pages,
            totalItems: result.data.pagination.total,
            itemsPerPage: result.data.pagination.limit,
          });
        }
      } else {
        // Handle pagination for all products
        const response = await productApi.getAll(
          newPage,
          pagination.itemsPerPage
        );
        setProducts(response.data);
        setFilteredProducts(response.data);

        setPagination({
          currentPage: response.pagination.page,
          totalPages: response.pagination.pages,
          totalItems: response.pagination.total,
          itemsPerPage: response.pagination.limit,
        });
      }

      // Scroll to top of products
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to load page"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFilteredProducts(products);
    setIsFiltered(false);
    setSegmentInfo(null);
    setCurrentRules("");

    // Reset pagination
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: products.length,
      itemsPerPage: 20,
    });
  };

  const handleTriggerIngestion = async () => {
    try {
      setIsLoading(true);
      await productApi.triggerIngestion();
      alert("Product ingestion triggered successfully!");
      await fetchProducts();
    } catch (err: any) {
      alert(
        "Failed to trigger ingestion: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                WooCommerce Product Segmentation
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Filter and segment products using text-based rules
              </p>
            </div>
            <button
              onClick={handleTriggerIngestion}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Sync Products
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SegmentEditor
            onEvaluate={handleEvaluate}
            onReset={handleReset}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
          />
        </div>

        {isFiltered && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-800 font-medium">{segmentInfo}</p>
              {pagination.totalPages > 1 && (
                <p className="text-sm text-blue-600">
                  Page {pagination.currentPage} of {pagination.totalPages} •
                  Total: {pagination.totalItems} products
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isFiltered ? "Filtered Products" : "All Products"}
            </h2>
            <div className="text-sm text-gray-600">
              {pagination.totalPages > 1 ? (
                <span>
                  Showing {filteredProducts.length} of{" "}
                  <span className="font-semibold">{pagination.totalItems}</span>{" "}
                  product{pagination.totalItems !== 1 ? "s" : ""}
                </span>
              ) : (
                <span>
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="animate-spin h-12 w-12 text-blue-600"
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
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error: {error}</p>
              <button
                onClick={() => fetchProducts()}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isFiltered
                  ? "Try adjusting your segment rules"
                  : 'Click "Sync Products" to fetch products from WooCommerce'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredProducts.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            WooCommerce Segmented Products - Microservices Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
