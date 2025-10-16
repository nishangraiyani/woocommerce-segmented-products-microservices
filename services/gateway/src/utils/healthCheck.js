import axios from "axios";


class HealthChecker {
  constructor() {
    this.services = new Map();
  }

  addService(name, url, timeout = 5000) {
    this.services.set(name, { url, timeout });
  }

   
  async checkService(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    const startTime = Date.now();

    try {
      const response = await axios.get(service.url, {
        timeout: service.timeout,
        headers: {
          "User-Agent": "Gateway-Service-Health-Check",
        },
      });

      const responseTime = Date.now() - startTime;

      return {
        name,
        status: "healthy",
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          statusCode: response.status,
          url: service.url,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: "unhealthy",
        responseTime,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          code: error.code,
          url: service.url,
        },
      };
    }
  }

  async checkAllServices() {
    const results = {};
    const checks = [];

    for (const [name] of this.services) {
      checks.push(this.checkService(name));
    }

    const healthResults = await Promise.all(checks);

    healthResults.forEach((result) => {
      results[result.name] = result;
    });

    // Calculate overall status
    const unhealthyServices = healthResults.filter(
      (r) => r.status === "unhealthy"
    );
    const overallStatus =
      unhealthyServices.length === 0 ? "healthy" : "degraded";

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: results,
      summary: {
        total: healthResults.length,
        healthy: healthResults.filter((r) => r.status === "healthy").length,
        unhealthy: unhealthyServices.length,
      },
    };
  }

  getServices() {
    return Array.from(this.services.keys());
  }

  removeService(name) {
    return this.services.delete(name);
  }
}

export default HealthChecker;
