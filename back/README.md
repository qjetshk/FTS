 email-worker:
    build:
      context: ../email-worker
      dockerfile: Dockerfile.dev
      args:
        HTTP_PROXY: http://host.docker.internal:10810
        HTTPS_PROXY: http://host.docker.internal:10810
    container_name: fts-email-worker
    restart: always
    env_file: ../email-worker/.env
    volumes:
      - ../email-worker:/app
      - /app/node_modules
    command: npm run start:dev
    depends_on:
      - redis