# OSL validation checklist

Run after deploy and after any connector env change. Fail closed: never treat a 503 as success.

## Kill switches

- `PROPOSE_DISABLED=true` → `/api/propose` returns 503
- `WRITEBACK_DISABLED=true` → `/api/writeback` returns 503

## Staging smoke (10 minutes)

1. Open the public URL. Landing shows Soft Launch copy, Privacy, Terms, Invite.
2. Request a magic link at `/login`. Email arrives. Link signs you in.
3. Refresh on another tab: workspace (role, notes, Inbox) is still there.
4. Diagnose a job title on `/start`. Install **AI-PM** pack.
5. Hub: Slack and Linear say Live only if OAuth env is set. Other tiles say Preview or Demo.
6. Connect Slack (real). Connect Linear (real).
7. Paste notes or sample meeting → Run Pack Crew. Proposals mention Slack context if Slack is connected.
8. Approve one item. Linear shows a **real** issue identifier (not `LIN-DEMO-###`).
9. Brief lists the decision and the write-back.
10. Sign out. Sign in again. Lake still has the decision.

## API checks

```bash
# unauthenticated propose
curl -sS -X POST "$APP_URL/api/propose" -H 'Content-Type: application/json' -d '{"notes":"hi","roleId":"ai-pm"}'
# expect 401

# contact still works
curl -sS -X POST "$APP_URL/api/contact" -H 'Content-Type: application/json' \
  -d '{"firstName":"T","lastName":"T","email":"t@example.com","notes":"ping"}'
```

## Rate / cost

- Diagnose: 20/min per user (or IP if signed out)
- Contact: 8/min per IP
- Propose: 30/min per user+IP plus pack daily cap (AI-PM 40, Early Stage 15)
- Write-back: 20/min per user
