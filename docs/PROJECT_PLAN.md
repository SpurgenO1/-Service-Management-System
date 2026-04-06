# Project Plan and Timeline

## 1. Milestones

| Milestone | Outcome | Suggested duration |
|-----------|---------|--------------------|
| M1 — Foundation | SRS, architecture, DB/API docs signed off; repo runs locally | Week 1 |
| M2 — Core product | Auth + full request lifecycle + UI wired | Week 2–3 |
| M3 — Quality | Automated tests, seed data, bug fixes | Week 4 |
| M4 — Extended features | Notifications OR reports (pick priority) | Week 5–6 |
| M5 — Hardening | Security items (rate limit, reset or 2FA subset), HTTPS deploy | Week 7 |
| M6 — Viva / delivery | Demo script, documentation pack, retrospective | Week 8 |

Adjust lengths to your academic calendar; the table is a template.

## 2. Sprint example (2-week sprint)

**Sprint 1**

- Finalize documentation (this `docs/` folder).  
- Harden validation on register/login and create request.  
- Admin filtering/sorting (query params) if in scope.

**Sprint 2**

- Notification spike: email on assignment (single template).  
- Unit tests for `authController` and `authMiddleware`.

**Sprint 3**

- Report MVP: CSV export of requests for admin.  
- Load test script and document results in appendix to TEST_PLAN.

## 3. Backlog priorities (from PDF gap analysis)

1. **P0:** Input validation, error consistency, HTTPS deployment.  
2. **P1:** Password reset OR account lockout (pick one for demo depth).  
3. **P2:** Email notifications for status changes.  
4. **P3:** Analytics dashboard (charts from aggregated API).  
5. **P4:** SMS, 2FA, CAPTCHA (show design even if partially implemented).

## 4. Roles (team)

- Backend, frontend, QA, DevOps can be shared in small teams; map Azure DevOps tasks to owners.

## 5. Definition of Done

- Feature meets acceptance criteria in SRS.  
- API documented in **API_SPECIFICATION.md**.  
- Critical path covered by integration test or manual test record.  
- No secrets in repository.

## 6. Risk register (short)

| Risk | Mitigation |
|------|------------|
| Scope creep (2FA + SMS + reports) | Phase delivery; document “planned” in SRS |
| Mongo connectivity in demo | Atlas backup cluster + seeded local |
| Token theft demo question | Explain XSS/HTTPS and future httpOnly refresh |
