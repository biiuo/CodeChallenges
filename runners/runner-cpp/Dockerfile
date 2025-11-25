FROM debian:12-slim

# Install C++ compiler and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r runner && useradd -r -g runner runner

WORKDIR /sandbox

USER runner

# No entrypoint; worker will pass commands directly via docker run
