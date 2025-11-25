FROM node:20-slim

# Create non-root user for security
RUN groupadd -r runner && useradd -r -g runner runner

WORKDIR /sandbox

USER runner

# No entrypoint; worker will pass commands directly via docker run
