# Deployment Plan

## 1. Target environments

| Environment | Purpose | Notes |
|-------------|---------|--------|
| Local | Development | `mongodb://localhost:27017/...` or Atlas free tier |
| Staging | Pre-production test | Same config shape as prod, separate DB |
| Production | End users / viva demo | HTTPS mandatory |

## 2. Backend hosting options

- **Azure App Service** (aligns with Azure DevOps narrative)  
- **Render / Railway / Fly.io** — Node web service + env vars  
- **VPS** — Node + PM2 + nginx reverse proxy

**Process:** `node server.js` (or `npm start` if you add a start script). Set `PORT` from host.

## 3. Database hosting

- **MongoDB Atlas:** M0 cluster for development; backup enabled for production.  
- Connection string in `MONGO_URI` (SRV format).  
- IP allowlist or VPC peering for production security.

## 4. Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Strong random string for signing |
| `PORT` | no | Defaults to 3000 |

**Planned:** `SMTP_*`, `SMS_API_KEY`, `CAPTCHA_SECRET`, `FRONTEND_URL` for links in emails.

## 5. HTTPS

- Terminate TLS at platform (App Service) or nginx with certificates (Let’s Encrypt).  
- Redirect HTTP → HTTPS.  
- Set secure cookie flags if moving tokens to cookies.

## 6. CI/CD (optional)

**Azure DevOps Pipeline (outline):**

1. Trigger on `main` push or PR merge.  
2. `npm ci`  
3. `npm test` (when tests exist)  
4. Deploy to App Service via Azure Web App deploy task or container registry.

**Artifacts:** None required for static front end if served from same Express `public/` folder.

## 7. Monitoring and logging

- Application Insights (Azure) or generic: structured `console` / Winston logs.  
- Health endpoint (planned): `GET /health` returns DB ping status for uptime checks.

## 8. Rollback

- Keep previous deployment slot or container image tag.  
- Database migrations (if introduced): forward-only scripts with backups.

## 9. Pre-go-live checklist

- [ ] `JWT_SECRET` rotated from development default  
- [ ] MongoDB user has least privilege  
- [ ] CORS origins restricted to real front-end URL  
- [ ] `.env` not in image or repo  
- [ ] Demo users seeded via secure script, not default passwords in prod  
