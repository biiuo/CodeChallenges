FROM eclipse-temurin:17-jdk-jammy

# Create non-root user for security
RUN groupadd -r runner && useradd -r -g runner runner

WORKDIR /sandbox

USER runner

# No entrypoint; worker will pass commands directly via docker run
