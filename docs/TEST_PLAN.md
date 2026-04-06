# Test Plan

## 1. Objectives

- Verify functional correctness of authentication, RBAC, and service request lifecycle.  
- Validate input handling and error responses.  
- Establish baseline for performance under concurrent load (non-functional).  
- Provide repeatable test cases for regression (manual or automated).

## 2. Scope

| In scope | Out of scope (until built) |
|----------|----------------------------|
| Auth register/login | Email/SMS delivery |
| Client/admin/dev/tester APIs | 2FA, CAPTCHA |
| Request state transitions | Full analytics UI |
| Feedback rules | Report export files |

## 3. Test levels

### 3.1 Unit testing

**Target:** Controllers (with mocked Mongoose models), middleware (JWT verify with fixed secret), password hashing helpers.

**Tools (recommended):** Jest or Node `node:test` + `mongodb-memory-server` or mocks.

**Sample cases:**

| ID | Unit under test | Input | Expected |
|----|-----------------|-------|----------|
| UT-1 | `authUser` | valid email + password | returns token |
| UT-2 | `authUser` | wrong password | 401 |
| UT-3 | `protect` | missing Bearer | 401 |
| UT-4 | `protect` | wrong role | 403 |
| UT-5 | `updateTaskStatus` | dev not owner | 404 |

### 3.2 Integration testing

**Target:** Express app + real or in-memory MongoDB; HTTP client (`supertest`).

**Sample cases:**

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| IT-1 | Register + login | POST register, POST login | 201 then 200 with token |
| IT-2 | Client creates request | login as client, POST `/api/client/requests` | 201, `client` matches user |
| IT-3 | RBAC | client token on `GET /api/admin/requests` | 403 |
| IT-4 | Admin assigns | admin PUT request with `assignedDev` | status may become Assigned |
| IT-5 | Feedback gate | feedback on non-completed request | 400 |

### 3.3 Load and stress testing

**Target:** NFR-P.2 — concurrent users.

**Tools (recommended):** k6, Artillery, or Apache JMeter.

**Scenarios:**

- Ramp virtual users hitting `POST /login` and `GET /api/client/requests` with valid tokens.  
- Measure p95 latency, error rate, and throughput.  
- **Pass criteria (example):** p95 API latency &lt; 500 ms for read-heavy endpoints at N concurrent users (define N per hardware).

### 3.4 Security testing (smoke)

- Attempt access without token to protected routes → 401.  
- Tampered JWT → 401.  
- Role escalation attempts → 403.

## 4. Test environment

- Node version aligned with `package.json` engines (add `engines` if missing).  
- MongoDB: local or Atlas test cluster.  
- `.env.test` with test `JWT_SECRET` and `MONGO_URI`.

## 5. Entry and exit criteria

**Entry:** Build installs; DB reachable; test data seed optional (`seed.js`).  
**Exit:** All critical IT cases pass; no open P1 defects for auth or assignment flows.

## 6. Traceability to requirements

| SRS area | Test level |
|----------|------------|
| FR-1.x Auth | UT, IT, security smoke |
| FR-2.x Requests | IT, UT on transitions |
| NFR-P performance | Load tests |
| NFR-T quality | Coverage targets for new code (e.g. 60%+ controllers) |

## 7. Current repository note

`package.json` script `test` is a placeholder. Replace with a real runner (e.g. `jest` or `node --test`) when implementing automation.
