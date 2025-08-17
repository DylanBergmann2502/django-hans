# deploy/local/compose/vue/Dockerfile
# Stage 1: Dependencies
FROM node:22.18-bookworm-slim AS deps
WORKDIR /app

# Install only the packages needed to install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY web/package*.json ./
RUN npm ci

# Stage 2: Development
FROM node:22.18-alpine AS development
WORKDIR /app

# Install minimal development dependencies
RUN apk add --no-cache bash

# Install global packages
RUN npm install -g npm-check-updates

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY web/package*.json ./

# Copy start script
COPY ./deploy/local/compose/vue/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start
