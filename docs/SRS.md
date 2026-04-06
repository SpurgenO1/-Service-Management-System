# Software Requirements Specification (SRS)

**Project:** Service Management System (SMS)  
**Version:** 1.0  
**Date:** April 5, 2026  

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for the Service Management System. It is the authoritative reference for scope, behavior, interfaces, and quality attributes before and during development.

### 1.2 Scope

The system enables **clients** to register, authenticate, and submit service requests; **administrators** to manage and assign requests to **developers** and **testers**; **staff** to update work status; and (in the target vision) **notifications**, **reporting**, and **analytics**. The current codebase implements core auth, role-based APIs, and the service request lifecycle; several PDF requirements are specified here as **planned** enhancements (see §7).

### 1.3 Definitions

| Term | Definition |
|------|------------|
| Service request | A client-submitted unit of work with type, description, priority, status, and assignments |
| Staff | Users with roles `developer` or `tester` |
| JWT | JSON Web Token used for stateless authentication |

### 1.4 References

- Project repository: Express.js API, MongoDB (Mongoose), static HTML/JS/Bootstrap UI  
- Requirements source: SC Project SMS (functional and non-functional requirements document)

---

## 2. System Overview

### 2.1 Product perspective

A **three-tier** web application:

1. **Presentation:** Browser UI (static pages + JavaScript calling REST APIs).  
2. **Application:** Node.js + Express REST API, JWT middleware, controllers.  
3. **Data:** MongoDB persisting users, service requests, and feedback.

### 2.2 User classes

| Actor | Description |
|-------|-------------|
| Client | Registers, logs in, creates and tracks requests, submits feedback |
| Admin | Views all requests, assigns staff, updates status and metadata |
| Developer | Views assigned tasks, updates development status |
| Tester | Verifies work or reports bugs on assigned items |

### 2.3 Operating constraints

- Production use assumes **HTTPS** termination (reverse proxy or PaaS).  
- Secrets (`JWT_SECRET`, DB URI, mail/SMS keys) via environment variables, not source control.

---

## 3. Functional Requirements

### 3.1 Epic 1 — User authentication and account management

| ID | Requirement | Status (vs. codebase) |
|----|-------------|------------------------|
| FR-1.1 | Allow client (and other roles) registration with validated fields | **Implemented** (register; validation partial) |
| FR-1.2 | Store user data securely; hash passwords before storage | **Implemented** (bcrypt) |
| FR-1.3 | Success/error responses for registration | **Implemented** |
| FR-1.4 | Login with credential verification | **Implemented** |
| FR-1.5 | Issue authentication tokens (JWT) | **Implemented** |
| FR-1.6 | Handle login errors; redirect by role after login | **Implemented** (UI) |
| FR-1.7 | Password reset flow, reset tokens, email, secure password update | **Planned** |
| FR-1.8 | Account lockout after failed attempts | **Planned** |
| FR-1.9 | CAPTCHA on sensitive flows | **Planned** |
| FR-1.10 | Two-factor authentication (2FA) | **Planned** |
| FR-1.11 | Secure sessions; mitigate common attacks; enforce HTTPS in production | **Partial** (HTTPS deployment; see Security doc) |
| FR-1.12 | Roles defined; assignment; RBAC on APIs | **Implemented** |
| FR-1.13 | Real-time role change notification, session refresh on role change | **Planned** |

### 3.2 Epic 2 — Service request management

| ID | Requirement | Status |
|----|-------------|--------|
| FR-2.1 | Submit service request; validate input; persist; confirm to user | **Implemented** (create + list) |
| FR-2.2 | View request status and progress | **Implemented** (client/admin/dev/tester views via API/UI) |
| FR-2.3 | Update request details; validate; notify users | **Partial** (admin/staff updates; **notifications planned**) |
| FR-2.4 | Admin: view all requests; filter/sort; assign staff; update status; notify staff | **Partial** (view/update/assign; filter/sort/notify **planned**) |

### 3.3 Epic 3 — Notifications and alerts

| ID | Requirement | Status |
|----|-------------|--------|
| FR-3.1 | Email on request updates; event triggers; error handling | **Planned** |
| FR-3.2 | SMS alerts; formatting; triggers | **Planned** |
| FR-3.3 | Delivery tracking; retries; failure handling | **Planned** |

### 3.4 Epic 4 — Reporting and analytics

| ID | Requirement | Status |
|----|-------------|--------|
| FR-4.1 | Generate/download service request reports | **Planned** |
| FR-4.2 | Analytics dashboard (charts, insights) | **Planned** |

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-P)

| ID | Requirement | Approach |
|----|-------------|----------|
| NFR-P.1 | Responsive API | Indexes on frequent query fields; lean projections |
| NFR-P.2 | Concurrent users / load testing | Load tests per TEST_PLAN; scale app + DB |
| NFR-P.3 | Optimized queries | Mongoose `select`, `populate` only needed paths |
| NFR-P.4 | Fast reports | Pre-aggregation / batch jobs when reports exist |
| NFR-P.5 | Caching | HTTP cache headers, optional Redis for sessions/rate limits |
| NFR-P.6 | Lazy loading dashboards | UI pagination / incremental fetch |

### 4.2 Security (NFR-S)

Password hashing, HTTPS, JWT, RBAC, session security, lockout/CAPTCHA/2FA as specified in **SECURITY_DESIGN.md** (implemented vs. planned called out there).

### 4.3 Scalability (NFR-SC)

Horizontal scaling of stateless API; MongoDB replica set / sharding as data grows.

### 4.4 Reliability (NFR-R)

Graceful API errors; retries for email/SMS when implemented; health checks and logging.

### 4.5 Testing and quality (NFR-T)

Functional, integration, and load testing per **TEST_PLAN.md**.

### 4.6 Usability (NFR-U)

Intuitive UI, navigation, clear error messages (ongoing UI work).

### 4.7 Maintainability (NFR-M)

Modular routes/controllers/models; environment-based configuration; structured logging.

---

## 5. Assumptions and Constraints

### 5.1 Assumptions

- Users have modern browsers and JavaScript enabled.  
- Email/SMS providers will supply APIs and quotas when notification features are built.  
- MongoDB is available (Atlas or self-hosted).

### 5.2 Constraints

- Academic or small-team delivery timeline may phase advanced security and notifications.  
- Role changes affecting active JWTs require re-login or token refresh strategy when implemented.

---

## 6. External Interfaces

### 6.1 User interface

- Static pages under `public/` (auth, role dashboards).  
- Consumes JSON REST API with `Authorization: Bearer <token>`.

### 6.2 Software interfaces (API)

- Base path: `/api` — see **API_SPECIFICATION.md** for methods, bodies, and responses.

### 6.3 Database

- MongoDB connection via Mongoose — see **DATABASE_DESIGN.md**.

### 6.4 Planned interfaces

- SMTP or transactional email API.  
- SMS gateway API.  
- Optional OAuth/CAPTCHA provider endpoints.

---

## 7. Implementation Status Summary

Rough alignment with the “readiness” narrative:

- **Core request workflow + JWT auth + RBAC:** implemented in repository.  
- **Password reset, 2FA, CAPTCHA, lockout, email/SMS, delivery tracking, reports, analytics dashboard:** specified in this SRS as **planned**; design hooks described in architecture and security documents.

Use this SRS for viva and scope; use §3 tables to demonstrate traceability from requirements to code or backlog.
