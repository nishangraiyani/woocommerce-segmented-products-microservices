# Gateway Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy all package.json files first
COPY package*.json ./
COPY services/gateway/package*.json ./services/gateway/

# Install all dependencies from root
RUN npm install

# Create non-root user
RUN addgroup --system --gid 1001 nodegroup && \
    adduser --system --uid 1001 --ingroup nodegroup nodeuser

# Copy the rest of the application with correct ownership
COPY --chown=nodeuser:nodegroup ./services/gateway ./services/gateway

WORKDIR /app/services/gateway

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
CMD ["node", "src/index.js"]

