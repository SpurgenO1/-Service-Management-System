# API Specification

**Base URL:** `http://localhost:3000` (development) or deployed origin.  
**Content type:** `application/json` unless noted.  
**Auth:** Protected routes require header `Authorization: Bearer <JWT>`.

JWT payload (current implementation): `{ id, role, name }` (subject is user id).

---

## 1. Authentication (`/api/auth`)

### 1.1 Register

- **Method / path:** `POST /api/auth/register`  
- **Auth:** None  

**Request body:**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `name` | string | yes | |
| `email` | string | yes | Unique |
| `password` | string | yes | Min 8 characters; stored hashed |
| `role` | — | — | Ignored; public registration always creates `client` |

**Success:** `201 Created`

```json
{
  "_id": "<objectId>",
  "name": "string",
  "email": "string",
  "role": "client",
  "token": "<jwt>"
}
```

**Errors:**

| Status | Body | Condition |
|--------|------|-----------|
| `400` | `{ "message": "User already exists" }` | Duplicate email |
| `500` | `{ "message": "<error>" }` | Server/database error |

---

### 1.2 Login

- **Method / path:** `POST /api/auth/login`  
- **Auth:** None  

**Request body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | yes |
| `password` | string | yes |

**Success:** `200 OK` — same user fields + `token` as register.

**Errors:**

| Status | Body |
|--------|------|
| `400` | `{ "message": "...", "errors": [...] }` | Validation (e.g. invalid email, short password) |
| `401` | `{ "message": "Invalid email or password" }` | Wrong credentials |
| `423` | `{ "message": "Account is temporarily locked..." }` | Too many failed attempts |
| `429` | Rate limit body | Too many requests from same IP |
| `500` | `{ "message": "<error>" }` | |

---

### 1.3 Forgot password

- **Method / path:** `POST /api/auth/forgot-password`  
- **Auth:** None  

**Body:** `{ "email": "string" }`  

**Success:** `200 OK` — always the same generic message (no email enumeration). If `SMTP_*` is not set, the reset URL is logged to the server console. If `DEV_RETURN_RESET_TOKEN=true`, response may include `resetToken` for local testing only.

---

### 1.4 Reset password

- **Method / path:** `POST /api/auth/reset-password`  
- **Auth:** None  

**Body:** `{ "token": "string", "password": "string" }` (password min 8 chars)  

**Success:** `200 OK` — `{ "message": "Password updated..." }`  

**Errors:** `400` invalid/expired token; `400` validation.

---

## 2. Client (`/api/client`)

### 2.1 Create service request

- **Method / path:** `POST /api/client/requests`  
- **Auth:** Bearer, role `client`  

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `serviceType` | string | yes |
| `description` | string | yes |
| `priority` | string | no | `Low` \| `Medium` \| `High` |

**Success:** `201 Created` — full `ServiceRequest` document (JSON).

**Errors:** `401` no/invalid token; `403` wrong role; `500` server error.

---

### 2.2 List my requests

- **Method / path:** `GET /api/client/requests`  
- **Auth:** Bearer, role `client`  

**Success:** `200 OK` — array of requests with `assignedDev` and `assignedTester` populated (`name`, `email`), sorted by `createdAt` descending.

---

### 2.3 Submit feedback

- **Method / path:** `POST /api/client/feedback`  
- **Auth:** Bearer, role `client`  

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `serviceRequestId` | string (ObjectId) | yes |
| `rating` | number | yes | 1–5 |
| `comments` | string | no |

**Success:** `201 Created` — feedback document.

**Errors:**

| Status | Message |
|--------|---------|
| `404` | Request not found |
| `400` | Request must be completed to leave feedback |

---

## 3. Admin (`/api/admin`)

### 3.1 List all requests

- **Method / path:** `GET /api/admin/requests`  
- **Auth:** Bearer, role `admin`  

**Query (optional):**

| Param | Values |
|-------|--------|
| `status` | Same enum as request `status` |
| `priority` | `Low` \| `Medium` \| `High` |
| `sort` | `createdAt` (default) \| `priority` \| `status` |
| `order` | `desc` (default) \| `asc` |

**Success:** `200 OK` — array with `client`, `assignedDev`, `assignedTester` populated (`name`, `email`).

---

### 3.2 Update request

- **Method / path:** `PUT /api/admin/requests/:id`  
- **Auth:** Bearer, role `admin`  

**Body (all optional; send only fields to change):**

| Field | Type | Notes |
|-------|------|--------|
| `status` | string | Enum per model |
| `assignedDev` | string (ObjectId) | Developer user id |
| `assignedTester` | string (ObjectId) | Tester user id |
| `priority` | string | |
| `slaDeadline` | date string | |

**Behavior:** If `assignedDev` is a non-null id and current status is `Pending Approval`, status becomes `Assigned`. Sending `null` for `assignedDev` / `assignedTester` clears assignment.

**Success:** `200 OK` — updated request.

**Errors:** `404` not found; `401`/`403`; `500`.

---

### 3.3 List staff (developers + testers)

- **Method / path:** `GET /api/admin/staff`  
- **Auth:** Bearer, role `admin`  

**Success:** `200 OK` — user documents without `password` field.

---

## 4. Developer (`/api/developer`)

### 4.1 List assigned tasks

- **Method / path:** `GET /api/developer/tasks`  
- **Auth:** Bearer, role `developer`  

**Success:** `200 OK` — requests where `assignedDev` equals current user.

---

### 4.2 Update task status

- **Method / path:** `PUT /api/developer/tasks/:id/status`  
- **Auth:** Bearer, role `developer`  

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `devStatus` | string | yes | `Not Started` \| `In Progress` \| `Completed` |

**Side effects:** `In Progress` → request `status` = `In Development`; `Completed` → `In Testing`.

**Errors:** `404` if not found or not assigned to this developer.

---

## 5. Tester (`/api/tester`)

### 5.1 List tester tasks

- **Method / path:** `GET /api/tester/tasks`  
- **Auth:** Bearer, role `tester`  

**Success:** Requests where `assignedTester` is current user and `devStatus` is `Completed`.

---

### 5.2 Verify task

- **Method / path:** `PUT /api/tester/tasks/:id/verify`  
- **Auth:** Bearer, role `tester`  

**Success:** Sets `testerStatus` to `Verified`, `status` to `Ready for Delivery`, clears `bugsReported`.

**Errors:** `404` if not assigned.

---

### 5.3 Report bug

- **Method / path:** `PUT /api/tester/tasks/:id/bug`  
- **Auth:** Bearer, role `tester`  

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `bugsReported` | string | yes |

**Success:** `testerStatus` = `Bugs Found`, `devStatus` = `In Progress`, `status` = `In Development`.

---

## 6. Planned endpoints (PDF alignment)

Document these when implemented to avoid drift:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/forgot-password` | Issue reset token |
| `POST /api/auth/reset-password` | Validate token, set password |
| `POST /api/auth/2fa/enable` | 2FA setup |
| `GET/PUT /api/users/me` | Profile, preferences |
| `GET /api/requests?filter&sort` | Query params for admin/client |
| `GET /api/reports/summary` | Analytics |
| `GET /api/reports/export` | CSV/PDF |

---

## 7. Standard error envelope

Current pattern: `{ "message": "string" }`.  
Recommended evolution: `{ "message", "code", "details" }` for clients and monitoring.
