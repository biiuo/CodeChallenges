#!/bin/bash

echo "🔨 Building runner images..."

# Build all runner images
docker build -t runner-python:latest -f runners/runner-python/Dockerfile runners/ &
PID1=$!

docker build -t runner-node:latest -f runners/runner-node/Dockerfile runners/ &
PID2=$!

docker build -t runner-cpp:latest -f runners/runner-cpp/Dockerfile runners/ &
PID3=$!

docker build -t runner-java:latest -f runners/runner-java/Dockerfile runners/ &
PID4=$!

# Wait for all builds to complete
wait $PID1
wait $PID2
wait $PID3
wait $PID4

echo "✅ All runner images built successfully!"
echo ""
echo "Available images:"
docker images | grep "runner-"
