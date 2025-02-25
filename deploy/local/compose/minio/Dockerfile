# deploy/local/compose/minio/Dockerfile
FROM minio/minio:latest

EXPOSE 9000 9001

ENTRYPOINT ["minio"]
CMD ["server", "/data", "--console-address", ":9001"]
