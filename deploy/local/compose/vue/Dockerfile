# deploy/local/compose/vue/Dockerfile
FROM node:25.8-alpine AS development
WORKDIR /app

# Install minimal development dependencies
RUN apk add --no-cache bash

# Upgrade to latest npm and install global packages
RUN npm install -g npm@latest npm-check-updates

# Copy start script
COPY ./deploy/local/compose/vue/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start
