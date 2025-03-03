# deploy/local/compose/vue/Dockerfile
FROM node:22.14-bookworm

# Install bash if not already present and npm-check-updates globally
RUN apt-get update && apt-get install -y bash && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g npm-check-updates

WORKDIR /app

COPY web/package*.json ./
RUN npm ci

EXPOSE 5173

CMD ["npm", "run", "dev"]
