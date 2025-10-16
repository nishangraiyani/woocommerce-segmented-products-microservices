import NodeCache from "node-cache";

class Cache {
  constructor(ttlSeconds = 300) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = null) {
    return this.cache.set(key, value, ttl);
  }

  del(key) {
    return this.cache.del(key);
  }

  flushAll() {
    return this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  generateKey(method, url, query = {}) {
    const queryString = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join("&");

    return `${method}:${url}${queryString ? `?${queryString}` : ""}`;
  }

  middleware() {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== "GET") {
        return next();
      }

      const cacheKey = this.generateKey(req.method, req.originalUrl, req.query);
      const cachedResponse = this.get(cacheKey);

      if (cachedResponse) {
        console.log(`Cache hit for: ${cacheKey}`);
        return res.json(cachedResponse);
      }

      // Store original json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(cacheKey, body);
          console.log(`Cached response for: ${cacheKey}`);
        }
        return originalJson.call(res, body);
      };

      next();
    };
  }
}

export default Cache;
