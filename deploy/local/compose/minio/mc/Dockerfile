# deploy/local/compose/minio/mc/Dockerfile
FROM minio/mc:latest

COPY ./deploy/local/compose/minio/mc/entrypoint /entrypoint
RUN chmod +x /entrypoint

ENTRYPOINT ["/entrypoint"]
