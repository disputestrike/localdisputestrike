# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Health check (PORT set by Railway at runtime)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD ["sh", "-c", "wget --no-verbose --tries=1 --spider \"http://localhost:${PORT:-3000}/api/health\" || exit 1"]

# Start the application
CMD ["node", "dist/index.js"]
