# deploy/production/compose/nginx/Dockerfile
# First stage: Build Frontend app
FROM node:24.11-bookworm AS builder

WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
# Copy and rename the production env file before building
COPY ./deploy/production/.envs/.vue .env.production
RUN npm run build

# Second stage: Nginx
FROM nginx:1.29.3-alpine

COPY ./deploy/production/compose/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
