import { createProxyMiddleware } from "http-proxy-middleware";


const createProxyRoutes = () => {
  const productServiceUrl =
    process.env.PRODUCT_SERVICE_URL || "http://localhost:5001";
  const segmentServiceUrl =
    process.env.SEGMENT_SERVICE_URL || "http://localhost:5002";

  // Proxy to Product Service
  const productProxy = createProxyMiddleware({
    target: productServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/products": "", // Remove /api/products prefix when forwarding
    },
  });

  // Proxy to Segment Service
  const segmentProxy = createProxyMiddleware({
    target: segmentServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/segments": "", // Remove /api/segments prefix when forwarding
    },
  });

  return {
    productProxy,
    segmentProxy,
  };
};

export default createProxyRoutes;
