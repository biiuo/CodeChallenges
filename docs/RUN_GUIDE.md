# CodeChallenges – Run & Operations Guide

## Overview
- Stack: NestJS + Prisma + PostgreSQL + Redis + Docker runners (Python/Node/CPP/Java).
- Flow: Controller → CreateSubmissionUseCase → Redis queue → Worker → Runner → DB results.
- Scope: Supports public challenges and scoped submissions via `courseId` and `evaluationId`.

## 1) Prerequisites
- Docker and Docker Compose installed.
- Ports available:
  - Backend `3000`, Postgres `5433`, Redis `6379`.

## 2) Start the Stack
```bash
cd /home/mgbel/pf/CodeChallenges
# Build and start all services
docker compose up -d
```
- The backend uses `docker/entrypoint.sh` to:
  - `npx prisma generate`
  - `npx prisma migrate deploy`

## 3) Seed Test Data
```bash
docker compose exec backend npx ts-node prisma/seed-test-data.ts
```
Creates:
- User: `test@test.com`, password: `Test123!`
- Challenge: `CH-NZJQV` (Hello World)
- Testcase: case 1 → input empty, expected output `Hello World`

## 4) Health Checks
```bash
# Backend health
curl -s http://localhost:3000/

# Database tables
docker compose exec db psql -U user -d codechallenges -c "\\dt"
```

### Quick DB Tables
```bash
docker compose exec db psql -U user -d codechallenges -c "\\dt"
```

## 5) Send a Submission (Public)
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' \
  | grep -o '"access":"[^"]*"' | cut -d'"' -f4)

# Send submission (Python)
curl -s -X POST http://localhost:3000/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "challengeId": "CH-NZJQV",
    "language": "python",
    "code": "print(\"Hello World\")"
  }'
```
Notes:
- Use `print("Hello World")` to match testcase output (no comma).

## 6) Inspect Processing
```bash
# Worker logs (queue and execution events)
docker compose logs -f worker | grep -E "submissionId|Dequeued|runner_(started|finished)|testcase_executed"

# Submission summary (latest)
docker compose exec db psql -U user -d codechallenges -c \
  'SELECT id,status,score,"timeMsTotal" FROM "Submission" ORDER BY id DESC LIMIT 5;'

# Per-test results
docker compose exec db psql -U user -d codechallenges -c \
  'SELECT "submissionId","caseNumber",status,"timeMs","errorMsg" FROM "SubmissionTestResult" ORDER BY "submissionId" DESC, "caseNumber";'
```

## 7) Scoped Submissions (Course/Evaluation)
### Create Course + Enroll User
```sql
-- Create course (id/code can be equal for simplicity)
INSERT INTO "Course" ("id","code","title")
VALUES ('COURSE-1','COURSE-1','Lenguaje Backend')
ON CONFLICT ("id") DO NOTHING;

-- Enroll seed user
INSERT INTO "CourseStudent" ("courseId","userId")
SELECT 'COURSE-1', "id" FROM "User" WHERE email='test@test.com'
ON CONFLICT DO NOTHING;
```

### Create Evaluation + Attach Challenge
```sql
-- Evaluation: date now, duration 90 minutes, linked to course
INSERT INTO "Evaluation" ("id","name","date","maxDuration","courseId")
VALUES (1,'Parcial 1', now(), 90, 'COURSE-1')
ON CONFLICT ("id") DO NOTHING;

-- Include Hello World in evaluation
INSERT INTO "EvaluationChallenge" ("evaluationId","challengeId")
VALUES (1,'CH-NZJQV')
ON CONFLICT DO NOTHING;
```

### Submit to Course
```bash
curl -s -X POST http://localhost:3000/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "challengeId": "CH-NZJQV",
    "language": "python",
    "code": "print(\"Hello World\")",
    "courseId": "COURSE-1"
  }'
```

### Submit to Evaluation
```bash
curl -s -X POST http://localhost:3000/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "challengeId": "CH-NZJQV",
    "language": "python",
    "code": "print(\"Hello World\")",
    "evaluationId": 1
  }'
```

### Submit to Course + Evaluation
```bash
curl -s -X POST http://localhost:3000/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "challengeId": "CH-NZJQV",
    "language": "python",
    "code": "print(\"Hello World\")",
    "courseId": "COURSE-1",
    "evaluationId": 1
  }'
```

## 8) Architecture – Files & Responsibilities
- `docker-compose.yml`:
  - `backend`: API + enqueuer, mounts project and docker socket.
  - `worker`: background worker loop (`ENABLE_WORKER=true`).
  - `db`: PostgreSQL 16 (`user:pass`).
  - `redis`: queue backend.
- `docker/entrypoint.sh`: Runs Prisma tasks before starting Nest app.
- `src/presentation/controllers/submission.controller.ts`: HTTP endpoints; calls use case; observability logs.
- `src/application/usesCases/submission/create-submission.use-case.ts`:
  - Validates input, optional scope (`courseId`/`evaluationId`).
  - Course: checks enrollment in `CourseStudent`; challenge-course assignment best-effort.
  - Evaluation: checks active window via `date + maxDuration`; verifies `EvaluationChallenge`; checks enrollment to evaluation’s course.
  - Creates `Submission` (QUEUED) and enqueues job into Redis (`submission.queue`).
- `src/infrastructure/queue/submission-queue.service.ts`: Redis `RPUSH/BLPOP` queue abstraction.
- `src/infrastructure/workers/submission-worker.service.ts`: Worker loop; dequeues jobs and processes them.
- `src/application/usesCases/submission/process-submission.use-case.ts`: Marks RUNNING, executes via runner, persists `SubmissionTestResult`, updates final status/score.
- `src/infrastructure/runners/enhanced-runner.service.ts`: Per-language Docker execution, stdin input, optional compilation (C++/Java), resource limits.

## 9) What’s Functional
- Submissions pipeline end-to-end.
- DB migrations auto-applied at start.
- Seeding: user/challenge/testcase.
- Worker isolation: only `worker` container consumes queue.
- Observability logs at each stage.
- `courseId`/`evaluationId` validation and persistence.

## 10) TODO – What’s Missing / Next
- Challenge↔Course relation check: replace best-effort with precise join according to your real Prisma relation/table.
- Leaderboards:
  - Course leaderboard: best submission per student across course challenges (score desc, time asc, submittedAt asc).
  - Evaluation leaderboard: aggregate across included challenges during active window.
- Runner debug mode:
  - Optional `RUNNER_DEBUG=true` to keep runner containers (no `--rm`) with predictable names; allow `docker logs -f`.
- Attempt limits & window enforcement for evaluations:
  - Enforce maximum attempts; block submissions after end time; admin endpoints to open/close.
- Additional runners / policies:
  - Strict resource constraints, seccomp/apparmor profiles; more languages.

## 11) Tips
- If your code prints `Hello, World!` but testcase expects `Hello World`, update the testcase or code accordingly.
- Inspect per-case runner stderr/output via worker logs (`testcase_executed`).
- Use `POST /submissions/:id/execute` (if enabled) to requeue existing submissions for professor debug.

## 12) API Endpoints
### Working Endpoints
- `GET /`:
  - Health check; returns basic status.
- `POST /auth/login`:
  - Authenticates user and returns `access` token.
- `POST /submissions`:
  - Create submission. Body: `challengeId`, `language`, `code`, optional `courseId`, `evaluationId`.
- `GET /submissions/:id` (if implemented):
  - Fetch a submission summary including status and score.

### Missing/Partial (Verify in your build)
- `GET /challenges/:id`:
  - Retrieve challenge details including testcases (professor/admin guard).
- `GET /courses/:id/challenges`:
  - List challenges assigned to a course.
- `GET /evaluations/:id/challenges`:
  - List challenges included in an evaluation.
- `POST /submissions/:id/execute`:
  - Requeue an existing submission for re-run (professor/admin only). Appears optional.

### Recommended Additions
- `GET /courses/:courseId/leaderboard`:
  - Returns course leaderboard. Aggregates best score per student across course challenges.
- `GET /evaluations/:evaluationId/leaderboard`:
  - Returns evaluation leaderboard limited to its window and included challenges.
- `GET /users/me/submissions`:
  - List current user’s submissions with filters (`challengeId`, `courseId`, `evaluationId`, `status`).
- `POST /courses` + `POST /courses/:id/enroll`:
  - Manage courses and enrollment (admin-only for creation; enrollment guarded).
- `POST /evaluations` + `POST /evaluations/:id/challenges`:
  - Manage evaluations and attach/detach challenges (admin/professor-only).
- `POST /challenges` + `POST /challenges/:id/testcases`:
  - Create and manage challenges/testcases (admin/professor-only).

Notes:
- Protect admin/professor endpoints with guards/roles.
- For leaderboards, define tie-breakers: `score DESC`, `timeMsTotal ASC`, `submittedAt ASC`.

## 13) Controllers Inventory & Status
### AuthController (`/auth`)
- Working:
  - `POST /auth/login`: JWT issuance.
  - `POST /auth/signup`: User registration.
  - `POST /auth/refresh`: Token refresh.
- Validate/verify:
  - Password policy, duplicate email, refresh token revocation.

### SubmissionController (`/submissions`)
- Working:
  - `POST /submissions`: Creates and queues submission (validates challenge; optional scope fields).
  - `GET /submissions`: Lists current user submissions.
  - `GET /submissions/:id`: Gets submission by ID.
  - `GET /submissions/:id/results`: Per-test-case results.
  - `GET /submissions/metrics`: Observability metrics JSON.
- Verify/adjust:
  - `POST /submissions/:id/execute`: Present but currently returns submission; should requeue+await or async re-run (professor/admin only).
- Validation gaps to add:
  - Enforce `courseId` enrollment and challenge-course assignment via real relation.
  - Enforce `evaluationId` window, inclusion via `EvaluationChallenge`, attempts limit.
  - Rate limiting per user; max concurrent RUNNING submissions.

### ChallengesController (`/challenges`)
- Working:
  - `POST /challenges`: Create challenge.
  - `GET /challenges`: List challenges.
  - `GET /challenges/:id`: Get challenge by ID.
  - `POST /challenges/:id/testcases`: Add testcases.
- Validate/verify:
  - Guards/roles for create/update/testcases (professor/admin).
  - Input validation: unique `challengeId`, testcase visibility, non-empty expected output.
- Missing/recommended:
  - `PUT /challenges/:id`: Update challenge.
  - `DELETE /challenges/:id`: Delete challenge.

### UsersController (`/users`)
- Working:
  - `GET /users/me`: Returns current user.
- Recommended:
  - `GET /users/me/submissions`: Filtered list of user submissions.

### MetricsController (`/metrics`)
- Working:
  - `GET /metrics/prometheus`: Prometheus format.
  - `GET /metrics/json`: JSON metrics.

### PingController (`/ping`)
- Working:
  - `GET /ping`: Simple health.

### Courses (recommended module)
- Missing (to add):
  - `POST /courses`: Create course (admin).
  - `POST /courses/:id/enroll`: Enroll user (admin/professor).
  - `GET /courses/:id/challenges`: List assigned challenges.
  - `GET /courses/:courseId/leaderboard`: Course leaderboard.
- Validations to add:
  - Unique `code/id`; enrollment duplicate checks; challenge-course relation integrity.

### Evaluations (recommended module)
- Missing (to add):
  - `POST /evaluations`: Create evaluation (admin/professor).
  - `POST /evaluations/:id/challenges`: Attach/detach challenges.
  - `GET /evaluations/:id/challenges`: List evaluation challenges.
  - `GET /evaluations/:evaluationId/leaderboard`: Evaluation leaderboard.
- Validations to add:
  - Active window (`date + maxDuration`); enrollment to course; attempt limits; tie-breaker policies.

## 14) Endpoint Validation Checklist
- Auth:
  - Strong password policy, duplicate email handling, refresh token rotation.
- Submissions:
  - Challenge exists; language allowed; code not empty.
  - Course enrollment + challenge assignment; evaluation window + inclusion + attempts.
  - Rate limiting and max concurrent RUNNING submissions.
- Challenges:
  - Unique identifiers; testcase validation; role guards.
- Courses/Evaluations:
  - Admin/professor guards; relation integrity; idempotent attach/enroll endpoints.

## 15) Quick Curl Examples (to verify endpoints)
```bash
# Auth
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Submissions list
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/submissions

# Submission by id
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/submissions/1

# Submission results
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/submissions/1/results

# Challenges list
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/challenges
```

