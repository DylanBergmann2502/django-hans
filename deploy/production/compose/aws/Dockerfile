# deploy/production/compose/aws/Dockerfile
FROM docker.io/amazon/aws-cli:2.24.16

# Clear entrypoint from the base image, otherwise it's always calling the aws CLI
ENTRYPOINT []
CMD ["/bin/bash"]

COPY ./deploy/production/compose/aws/maintenance /usr/local/bin/maintenance
COPY ./deploy/production/compose/postgres/maintenance/_sourced /usr/local/bin/maintenance/_sourced

RUN chmod +x /usr/local/bin/maintenance/*

RUN mv /usr/local/bin/maintenance/* /usr/local/bin \
    && rmdir /usr/local/bin/maintenance
