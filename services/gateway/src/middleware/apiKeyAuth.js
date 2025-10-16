const validApiKeys = process.env.API_KEYS;
const apiKeyAuth = (req, res, next) => {
  if (req.path === "/health" || req.path === "/") {
    return next();
  }

  const apiKey = req.headers["x-api-key"];

  if (validApiKeys.length === 0) {
    console.warn(
      "Warning: No API keys configured. Set API_KEYS environment variable."
    );
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      error: "x-api-key header is missing",
      timestamp: new Date().toISOString(),
    });
  }

  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
      error: "Invalid API key",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

export default apiKeyAuth;
