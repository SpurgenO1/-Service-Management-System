# Technology Stack Decision

## 1. Approved stack (current repository)

| Layer | Technology | Version (approx.) | Rationale |
|-------|------------|-------------------|-----------|
| Runtime | Node.js | LTS (e.g. 20.x) | Single language for full stack learning and hiring alignment |
| HTTP framework | Express | 5.x | Mature, minimal, large ecosystem |
| Database | MongoDB | 6+ / Atlas | Flexible schema for evolving request fields; Mongoose ODM |
| ODM | Mongoose | 9.x | Schemas, validation hooks, population |
| Auth | jsonwebtoken + bcryptjs | 9.x / 3.x | Industry-standard JWT + bcrypt |
| Config | dotenv | 17.x | Twelve-factor configuration |
| CORS | cors | 2.x | Browser cross-origin for dev |
| Frontend | HTML, CSS, JavaScript, Bootstrap | — | Fast delivery without build tooling; suitable for academic demos |
| Dev reload | nodemon | 3.x | Developer experience |

## 2. Project management / DevOps (as per your plan)

- **Azure DevOps** (or GitHub Actions): work items, boards, optional CI/CD pipelines.

## 3. Recommended additions (when requirements expand)

| Need | Options |
|------|---------|
| Validation | express-validator or zod |
| Testing | Jest + Supertest |
| Email | Nodemailer + SMTP or SendGrid API |
| SMS | Twilio or similar |
| Caching / rate limit | Redis + express-rate-limit |
| Production process manager | PM2, systemd, or container entrypoint |

## 4. Alternatives considered (one-line)

- **SQL (PostgreSQL + Prisma):** Strong for reporting and constraints; more migration overhead.  
- **Spring Boot / .NET:** Excellent for enterprise; heavier for small team vanilla-JS front end.

## 5. Freeze policy

Avoid changing database engine or auth model mid-project unless formally revising **SRS.md** and **DATABASE_DESIGN.md**. Minor library upgrades within the same major ecosystem are acceptable with regression tests.
