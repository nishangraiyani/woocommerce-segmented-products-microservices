const errorHandler = (err, req, res, next) => {
  console.error("Gateway Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Handle proxy errors
  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
      error: "Service is not responding",
      timestamp: new Date().toISOString(),
    });
  }

  if (err.code === "ENOTFOUND") {
    return res.status(503).json({
      success: false,
      message: "Service not found",
      error: "Unable to reach service",
      timestamp: new Date().toISOString(),
    });
  }

  if (err.code === "ETIMEDOUT") {
    return res.status(504).json({
      success: false,
      message: "Gateway timeout",
      error: "Request timed out",
      timestamp: new Date().toISOString(),
    });
  }

  // Handle rate limiting errors
  if (err.status === 429 || err.message?.includes("rate limit")) {
    return res.status(429).json({
      success: false,
      message: "Too many requests",
      error: "Rate limit exceeded",
      retryAfter: err.retryAfter || 60,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development" ? err.stack : "An error occurred",
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;
