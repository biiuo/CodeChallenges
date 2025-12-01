#!/bin/bash

# Build all runner images and the main application
# This script ensures everything is built and ready for docker-compose up

set -e

echo "🔨 Building runner images..."
docker build -t runner-python:latest ./runners/runner-python
docker build -t runner-node:latest ./runners/runner-node
docker build -t runner-cpp:latest ./runners/runner-cpp
docker build -t runner-java:latest ./runners/runner-java

echo "✅ All runner images built successfully!"
echo ""
echo "🐳 Building and starting services with docker-compose..."
docker-compose up -d

echo ""
echo "✨ Services started!"
echo ""
echo "📋 Services status:"
docker-compose ps
echo ""
echo "🌐 Backend API: http://localhost:3000"
echo "📊 Metrics: http://localhost:3000/metrics/prometheus"
echo "🔍 Redis Commander: http://localhost:8081"
echo ""
echo "💡 Tip: Run 'docker-compose logs -f backend' to see backend logs"
