"use client";

import { Product } from "@/services/api";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "instock":
        return "bg-green-100 text-green-800 border-green-300";
      case "outofstock":
        return "bg-red-100 text-red-800 border-red-300";
      case "onbackorder":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.title}
        </h3>

        {product.category && (
          <p className="text-sm text-gray-500 mb-3">
            <span className="font-medium">Category:</span> {product.category}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {product.on_sale && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                SALE
              </span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStockStatusColor(
              product.stock_status
            )}`}
          >
            {product.stock_status.toUpperCase()}
          </span>
          {product.stock_quantity !== null && (
            <span className="ml-2 text-sm text-gray-600">
              Qty: {product.stock_quantity}
            </span>
          )}
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-300"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-400">ID: {product._id}</p>
        </div>
      </div>
    </div>
  );
}
