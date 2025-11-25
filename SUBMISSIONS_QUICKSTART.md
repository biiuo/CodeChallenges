# Quick Start: Testing Submissions Integration

## Prerequisites

```bash
# Install dependencies
npm install

# Ensure Docker is running
docker --version  # Should show version

# Start services
docker-compose up -d postgres redis
```

---

## Step 1: Start the Application

```bash
npm run start:dev
```

Expected output:
```
[Nest] 12345  - 01/15/2024, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/15/2024, 10:30:01 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 01/15/2024, 10:30:02 AM     LOG [InstanceLoader] SubmissionModule dependencies initialized
[Nest] 12345  - 01/15/2024, 10:30:03 AM     LOG Nest application successfully started
```

---

## Step 2: Get an Authentication Token

### Option A: Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_abc123",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Option B: Login with Existing User

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

**Save the accessToken** - you'll need it for all requests.

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Step 3: Create a Challenge (with test cases)

```bash
curl -X POST http://localhost:3000/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "description": "Print Hello World",
    "difficulty": "EASY",
    "testCases": [
      {
        "input": "",
        "output": "Hello World"
      }
    ]
  }'
```

Save the returned challenge ID (e.g., `ch_abc123`).

---

## Step 4: Create a Submission

### Python Example

```bash
curl -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello World\")",
    "language": "python",
    "challengeId": "ch_abc123"
  }'
```

Response (HTTP 201):
```json
{
  "id": 1,
  "userId": "user_abc123",
  "challengeId": "ch_abc123",
  "code": "print(\"Hello World\")",
  "language": "python",
  "status": "QUEUED",
  "score": 0,
  "timeMsTotal": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Note:** Submission returns immediately with status `QUEUED`. Execution happens asynchronously.

---

## Step 5: Check Submission Status

After a few seconds, check the result:

```bash
curl -X GET http://localhost:3000/submissions/1 \
  -H "Authorization: Bearer $TOKEN"
```

Response (after execution completes):
```json
{
  "id": 1,
  "userId": "user_abc123",
  "challengeId": "ch_abc123",
  "code": "print(\"Hello World\")",
  "language": "python",
  "status": "ACCEPTED",
  "score": 100,
  "timeMsTotal": 145,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:02Z"
}
```

---

## Step 6: List Your Submissions

```bash
curl -X GET http://localhost:3000/submissions \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
[
  {
    "id": 1,
    "userId": "user_abc123",
    "challengeId": "ch_abc123",
    "code": "print(\"Hello World\")",
    "language": "python",
    "status": "ACCEPTED",
    "score": 100,
    "timeMsTotal": 145,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:02Z"
  }
]
```

---

## Test Cases

### Test 1: Correct Solution (ACCEPTED)

```bash
curl -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello World\")",
    "language": "python",
    "challengeId": "ch_abc123"
  }'

# After 2-3 seconds:
# status = "ACCEPTED", score = 100
```

### Test 2: Wrong Answer (WRONG_ANSWER)

```bash
curl -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Goodbye World\")",
    "language": "python",
    "challengeId": "ch_abc123"
  }'

# After 2-3 seconds:
# status = "WRONG_ANSWER", score = 0
```

### Test 3: Compilation Error (COMPILATION_ERROR)

```bash
curl -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello World\"",
    "language": "python",
    "challengeId": "ch_abc123"
  }'

# After 2-3 seconds:
# status = "COMPILATION_ERROR", score = 0
```

### Test 4: Infinite Loop (TIME_LIMIT_EXCEEDED)

```bash
curl -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "while True: pass",
    "language": "python",
    "challengeId": "ch_abc123"
  }'

# After ~1.5 seconds:
# status = "TIME_LIMIT_EXCEEDED", score = 0
```

### Test 5: Runtime Error (RUNTIME_ERROR)

```bash
curl -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "x = 1 / 0",
    "language": "python",
    "challengeId": "ch_abc123"
  }'

# After 2-3 seconds:
# status = "RUNTIME_ERROR", score = 0
```

---

## Supported Languages

| Language | Code | Runner Image | Syntax Extension |
|----------|------|--------------|------------------|
| Python   | `python`, `python3` | `runner-python:latest` | `.py` |
| Node.js  | `node`, `nodejs`, `js` | `runner-node:latest` | `.js` |
| C++      | `cpp`, `c++` | `runner-cpp:latest` | `.cpp` |
| Java     | `java` | `runner-java:latest` | `.java` |

---

## View Metrics

### Prometheus Metrics

```bash
curl http://localhost:3000/metrics/prometheus
```

Output:
```
# HELP submissions_total Total number of submissions by status
# TYPE submissions_total counter
submissions_total{status="accepted"} 3
submissions_total{status="wrong_answer"} 1
submissions_total{status="compilation_error"} 1

# HELP average_execution_time_ms Average execution time in milliseconds
# TYPE average_execution_time_ms gauge
average_execution_time_ms 145

# HELP active_runners Active runner processes
# TYPE active_runners gauge
active_runners 0
```

### JSON Metrics

```bash
curl http://localhost:3000/metrics/json
```

Output:
```json
{
  "submissions": {
    "total": 5,
    "accepted": 3,
    "wrongAnswer": 1,
    "compilationError": 1,
    "timedOut": 0,
    "runtimeError": 0
  },
  "averageExecutionTimeMs": 145,
  "activeRunners": 0
}
```

---

## Docker Commands (Debugging)

### View Running Containers

```bash
docker ps
```

### View Submission Container Logs

```bash
docker logs <container_id>
```

### Manual Docker Test

```bash
# Build runner image
docker build -t runner-python:latest runners/runner-python

# Run test submission
docker run \
  --rm \
  --network none \
  --cpus 0.5 \
  --memory 512m \
  --read-only \
  --tmpfs /tmp:rw,exec,size=128m \
  -v /tmp/test:/submission:ro \
  runner-python:latest \
  sh -c "python /submission/solution.py < /submission/input.txt"
```

---

## Troubleshooting

### 1. "Cannot find module 'uuid'"

```bash
npm install uuid
```

### 2. Docker containers fail to start

```bash
# Check Docker daemon is running
docker ps

# Check compose file
docker-compose config
```

### 3. Database connection refused

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Check connection
psql postgres://user:password@localhost:5432/codechallenge
```

### 4. Submission stuck in QUEUED

Check application logs:
```bash
npm run start:dev  # View console output
```

Check Docker logs:
```bash
docker logs <container_id>
```

### 5. Bearer token invalid

Ensure token format is correct:
```bash
# WRONG:
-H "Authorization: eyJ0eXAiOiJKV1QiLC..."

# CORRECT:
-H "Authorization: Bearer eyJ0eXAiOiJKV1QiLC..."
```

---

## Next Steps

1. ✅ Submissions working
2. ⚠️ Integrate test cases fetching from challenges
3. ⚠️ Add Bull Queue for async job processing
4. ⚠️ Add Swagger documentation
5. ⚠️ Implement Evaluations (Módulo 6)
6. ⚠️ Implement Leaderboard (Módulo 7)
