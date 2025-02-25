# deploy/local/compose/vue/Dockerfile
FROM node:22.14-bookworm

# Install bash if not already present and npm-check-updates globally
RUN apt-get update && apt-get install -y bash && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g npm-check-updates

WORKDIR /app

COPY web/package*.json ./
RUN npm ci

COPY ./deploy/local/compose/vue/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

EXPOSE 5173

ENTRYPOINT ["/entrypoint"]
CMD ["npm", "run", "dev"]
