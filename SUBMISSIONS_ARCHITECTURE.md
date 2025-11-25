# Submissions Module Architecture

## Complete Integration Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                   SubmissionController                              │
│                                                                     │
│  POST   /submissions              (create + auto-exec)             │
│  GET    /submissions/:id          (retrieve)                       │
│  GET    /submissions              (list by user)                   │
│  POST   /submissions/:id/execute  (manual trigger)                 │
│                                                                     │
│  ┌── @UseGuards(JwtAuthGuard)                                      │
│  └── Extracts userId from JWT token                                │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ injects
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│            ProcessSubmissionUseCase                                 │
│                                                                     │
│  Receives:  {submissionId, code, language, testCases, timeLimit}  │
│                                                                     │
│  Steps:                                                             │
│    1. Get runner image (python → runner-python:latest)             │
│    2. Call runner.executeAgainstTestCases()                        │
│    3. Calculate result: ACCEPTED|WA|TLE|RE|CE|ERROR               │
│    4. Calculate score: (correctCases / totalCases) * 100          │
│    5. Log event to observability service                           │
│    6. Return result                                                │
│                                                                     │
│  Returns: {status, score, totalTimeMs, cases: []}                 │
└────────────┬──────────────────────┬─────────────────────────────────┘
             │                      │
      injects│                      │injects
             ▼                      ▼
┌─────────────────────────┐  ┌──────────────────────────┐
│  INFRASTRUCTURE LAYER   │  │ OBSERVABILITY SERVICE    │
├─────────────────────────┤  ├──────────────────────────┤
│  RunnerService          │  │                          │
│                         │  │ ✓ JSON structured logs  │
│ executeAgainstTestCases │  │ ✓ Prometheus metrics    │
│    ↓                    │  │ ✓ Submission tracking   │
│ For each test case:     │  │                          │
│  1. Build Docker cmd    │  └──────────────────────────┘
│  2. Write code to tmpfs │
│  3. Write input to file │
│  4. docker run [flags]  │
│  5. Capture output      │
│  6. Compare with expect │
│  7. Record: {output,    │
│     stderr, status,     │
│     timeMsElapsed}      │
│                         │
│  Flags:                 │
│  --network none         │
│  --cpus 0.5             │
│  --memory 512m          │
│  --read-only            │
│  --tmpfs /tmp:rw       │
│  --pids-limit 10        │
└────────────┬────────────┘
             │
             │ executes in
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              DOCKER CONTAINERS (Execution Layer)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  runner-python:latest    (Python 3.11)                             │
│  runner-node:latest      (Node.js 20)                              │
│  runner-cpp:latest       (GCC C++)                                 │
│  runner-java:latest      (Java 17)                                 │
│                                                                     │
│  Each container:                                                   │
│  • Non-root user (runner)                                          │
│  • Isolated filesystem                                             │
│  • No network access                                               │
│  • 1.5s timeout                                                    │
│  • 512 MB memory limit                                             │
│                                                                     │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ updates
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│           PrismaSubmissionRepository                                │
│                                                                     │
│  SubmissionEntity {                                                 │
│    id: number                                                      │
│    userId: string                                                  │
│    challengeId: string                                             │
│    code: string                                                    │
│    language: string                                                │
│    status: SubmissionStatus                                        │
│    score: number                                                   │
│    timeMsTotal: number                                             │
│    createdAt: Date                                                 │
│    updatedAt: Date                                                 │
│  }                                                                  │
│                                                                     │
│  Operations:                                                        │
│  • create(data)         → Insert new submission                    │
│  • findById(id)         → Get by ID                                │
│  • findByUser(userId)   → List user submissions                    │
│  • findByChallenge(id)  → List challenge submissions               │
│  • update(id, data)     → Update status/score/results              │
│                                                                     │
└────────────┬────────────────────────────────────────────────────────┘
             │
             │ persists
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               DATABASE (PostgreSQL)                                │
├─────────────────────────────────────────────────────────────────────┤
│  Submission table                                                  │
│  (managed by Prisma ORM)                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Execution Timeline

```
Time (ms)   Event
0           POST /submissions received
            ↓ JWT auth guard checks token
            ↓ Extract userId from token
            
1           SubmissionController.createSubmission()
            ↓ Validate DTO: { code, language, challengeId }
            
2           Call submissionRepo.create()
            ↓ Insert into DB with status: QUEUED
            
3           Return HTTP 201 to client
            ↓ (Client receives response here)
            
4           executeSubmissionAsync() runs (fire-and-forget)
            ↓ Mark submission as RUNNING
            
5           Fetch test cases for challenge
            
10          ProcessSubmissionUseCase.execute()
            ↓ Map language → runner image
            
20          RunnerService.executeAgainstTestCases()
            ↓ For each test case:
            
30-1530     Test Case 1:
            • Write code to /tmp/xyz/solution.py
            • Write input to /tmp/xyz/input.txt
            • docker run runner-python:latest
            • Execute: python /submission/solution.py < input.txt
            • Capture stdout/stderr
            • Compare output with expected
            • Record: { output, status, timeMsElapsed }
            
1530-1545   Test Case 2, 3, N...
            
1600        All test cases executed
            ↓ Calculate final status
            
1601        calculateResult()
            → Check if all passed → ACCEPTED
            → Check if any timed out → TIME_LIMIT_EXCEEDED
            → Check if any compile error → COMPILATION_ERROR
            → Check if any wrong answer → WRONG_ANSWER
            → Score = (correctCases / totalCases) * 100
            
1602        Update DB:
            • status = ACCEPTED
            • score = 100
            • timeMsTotal = 145
            
1603        Log event:
            • submissionId, userId, status, score, durationMs
            • level: info, timestamp: ISO, language
            
1604        Record metrics:
            • submissions_total{status="accepted"} += 1
            • average_execution_time_ms = (old + 145) / 2
```

---

## Request/Response Examples

### Create Submission
```
POST /submissions
Authorization: Bearer eyJ0eXAiOiJKV1QiLC...

{
  "code": "print('Hello World')",
  "language": "python",
  "challengeId": "ch_123"
}

Response (HTTP 201):
{
  "id": 42,
  "userId": "user_abc",
  "challengeId": "ch_123",
  "code": "print('Hello World')",
  "language": "python",
  "status": "QUEUED",
  "score": 0,
  "timeMsTotal": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### List User Submissions
```
GET /submissions
Authorization: Bearer eyJ0eXAiOiJKV1QiLC...

Response (HTTP 200):
[
  {
    "id": 42,
    "userId": "user_abc",
    "challengeId": "ch_123",
    "code": "print('Hello World')",
    "language": "python",
    "status": "ACCEPTED",
    "score": 100,
    "timeMsTotal": 145,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:31:00Z"
  },
  {
    "id": 41,
    "userId": "user_abc",
    "challengeId": "ch_122",
    "code": "...",
    "language": "javascript",
    "status": "WRONG_ANSWER",
    "score": 50,
    "timeMsTotal": 230,
    "createdAt": "2024-01-15T10:20:00Z",
    "updatedAt": "2024-01-15T10:21:00Z"
  }
]
```

### Get Specific Submission
```
GET /submissions/42
Authorization: Bearer eyJ0eXAiOiJKV1QiLC...

Response (HTTP 200):
{
  "id": 42,
  "userId": "user_abc",
  "challengeId": "ch_123",
  "code": "print('Hello World')",
  "language": "python",
  "status": "ACCEPTED",
  "score": 100,
  "timeMsTotal": 145,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:31:00Z"
}
```

---

## Module Dependency Tree

```
AppModule
├── imports SubmissionModule
│   ├── imports PrismaModule (← Database)
│   ├── imports RunnerModule (← Docker execution)
│   ├── imports ObservabilityModule (← Logging/metrics)
│   ├── providers
│   │   ├── ProcessSubmissionUseCase
│   │   └── PrismaSubmissionRepository
│   └── controllers
│       └── SubmissionController
│           ├── injects ProcessSubmissionUseCase
│           └── injects PrismaSubmissionRepository
│
├── imports CoreModule (Prisma setup)
├── imports AuthModule (JWT auth)
├── imports ChallengeModule (Challenge CRUD)
├── imports UserModule (User management)
├── imports CourseModule (Course management)
├── imports RedisModule (Caching)
├── imports RunnerModule (Docker containers)
├── imports ObservabilityModule (Logging/metrics)
└── imports CacheModule (Cache manager)
```

---

## Security Layers

```
Request
  ↓
1. JWT Auth Guard (@UseGuards(JwtAuthGuard))
   • Verify token signature
   • Extract userId from payload
   • Only allow if valid
   
   ↓ (Rejected if invalid token)
   
2. User Isolation
   • Controller checks req.user.userId
   • Repository queries filtered by userId
   • Users can only see own submissions
   
   ↓
   
3. Code Execution Sandbox
   • Docker container with isolated filesystem
   • --network none: No network access
   • --cpus 0.5: CPU limit
   • --memory 512m: Memory limit
   • --read-only: Filesystem read-only (except /tmp)
   • Non-root user: Limited privileges
   • 1.5s timeout: Kill after max time
   
   ↓
   
4. Output Comparison
   • Compare normalized text
   • Trim whitespace, split by newlines
   • Ignore harmless differences
   • Detect cheating attempts
```

---

## Status Transitions

```
        ┌─────────────┐
        │   QUEUED    │
        └──────┬──────┘
               │
         submit / execute
               │
               ▼
        ┌─────────────┐
        │  RUNNING    │
        └──────┬──────┘
               │
        execution completes
               │
    ┌──┬──┬───┴────┬──────┬────┐
    │  │  │        │      │    │
    ▼  ▼  ▼        ▼      ▼    ▼
   ACK WA TLE      RE     CE   ERROR
   
ACK     = ACCEPTED             (All test cases passed)
WA      = WRONG_ANSWER         (Output mismatch)
TLE     = TIME_LIMIT_EXCEEDED  (Took > 1500ms)
RE      = RUNTIME_ERROR        (Crash, exception)
CE      = COMPILATION_ERROR    (Syntax error)
ERROR   = RUNTIME_ERROR        (System error)
```

---

## Performance Metrics

**Endpoints latency (typical):**
- `POST /submissions` → 2ms (returns immediately)
- `GET /submissions` → 10ms (query DB)
- `GET /submissions/:id` → 5ms (direct lookup)
- `POST /submissions/:id/execute` → 50-1600ms (depends on code)

**Async execution time:**
- Code execution in Docker → 50-1500ms per test case
- Test case comparison → 5ms
- DB update → 10ms
- Total async time → 100-2000ms (depending on test cases)

**Database storage per submission:**
- ~500 bytes (code not stored, just reference)
- 10,000 submissions → ~5MB

---

## Next Implementation Steps

### 1. Test Cases Integration
```typescript
// In SubmissionController.getTestCasesForChallenge():
const challenge = await this.challengeRepo.findById(challengeId);
return challenge.testCases || [];
```

### 2. Bull Queue (Production)
```typescript
// Async job processing
@Processor('submissions')
export class SubmissionProcessor {
  @Process()
  async handleSubmission(job: Job<CreateSubmissionDTO>) {
    const result = await this.processSubmission.execute(job.data);
  }
}
```

### 3. Swagger Decorators
```typescript
@Post()
@ApiOperation({ summary: 'Create and execute submission' })
@ApiResponse({ status: 201, description: 'Submission created' })
async createSubmission(...) { }
```

