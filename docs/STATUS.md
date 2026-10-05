# Stack Spoon — status (2026-08-16)

## Live

Local: http://127.0.0.1:3000/

Deploy: Vercel project rooted at `web/`. Set prod env from `web/.env.example`. On Vercel, `DATABASE_URL` is required so sessions and Lake persist.

## Accomplished

1. Brand + spoon-fed Role → Pack → Hub → Approve → Brief
2. Next.js app with invite **magic-link auth** (Resend) and per-user workspace (JSON file locally, Postgres when `DATABASE_URL` is set)
3. 20 Role Packs (Live: AI-PM + Early Stage)
4. Diagnose + Propose APIs (Gemini chain) with user-scoped cost caps
5. Contact + design-partner checkbox → email + partner log
6. Slack **read** OAuth and Linear **write on Approve** when app keys are set (fail closed 503 otherwise)
7. Privacy, Terms, Invite pages; Vercel Analytics; propose/write kill switches
8. Relay Refuge at `/refuge`

## Honest limits

- Without Slack/Linear OAuth apps, Hub still simulates those connects and may stamp `LIN-DEMO-###`
- Calendar / Granola / Notion / HubSpot / GitHub stay Preview or demo
- Overnight digest is still a toggle
- Inbox-in-Slack / Drift / Crew Bridge are not live systems
- Sending domain may still be Resend onboarding until DNS is verified

## Soft Launch exit (not all green yet)

1. Public URL + Contact — deploy + secrets
2. Signed-in durable workspace — code done; needs `DATABASE_URL` on Vercel
3. Slack read + Linear write on Approve — code done; needs Slack + Linear apps
4. Design partners completing the loop — playbook in `docs/OSL-partner-playbook.md`
5. Preview never looks live — Hub banners updated

## Run

```bash
cd web && npm run dev -- -H 127.0.0.1 -p 3000
```
