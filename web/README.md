# Stack Spoon — Soft Launch foundation

Spoon-fed path: **landing → sign in → role → Role Pack → Connector Hub → Approve Inbox → Monday Morning Brief**.

**Local:** [http://127.0.0.1:3000](http://127.0.0.1:3000)

## What ships

- Invite magic-link auth (Resend). Product routes require a session.
- Per-user Context Lake / Inbox (local `.data/` file, or Postgres via `DATABASE_URL`)
- Diagnose + Propose (Gemini when keyed) with user-scoped cost caps
- Slack **read** and Linear **write on Approve** when OAuth apps are configured (otherwise 503 / demo)
- Contact form + design-partner interest
- Privacy, Terms, Invite

## Run

```bash
cd web
npm install
npm run dev -- -H 127.0.0.1 -p 3000
```

Copy `web/.env.example` to `web/.env.local`. Minimum for local sign-in + contact:

```bash
AUTH_SECRET=long-random-string
RESEND_API_KEY=re_...
GOOGLE_GENERATIVE_AI_API_KEY=...
CONTACT_TO_EMAIL=rallabandiai@gmail.com
CONTACT_FROM_EMAIL=Stack Spoon <onboarding@resend.dev>
```

Anyone who submits `/login` is saved to the invite list. Magic-link delivery to arbitrary inboxes needs a verified Resend domain and `CONTACT_FROM_EMAIL` on that domain. Until then, Resend only delivers to the account owner; local non-production still shows an openable sign-in link.

On **Vercel**, also set `DATABASE_URL` (Neon) and `APP_URL` to the production origin. Slack/Linear callback URLs must match `{APP_URL}/api/connectors/slack/callback` and `.../linear/callback`.

Kill switches: `PROPOSE_DISABLED=true`, `WRITEBACK_DISABLED=true`.

## Deploy

Root directory: `web`. See `docs/OSL-validation-checklist.md` and `docs/OSL-partner-playbook.md`.

## Demo path (signed in)

1. Magic link → `/start`
2. AI-PM pack
3. Connect Slack + Linear when live; other tiles stay Preview
4. Notes → Inbox → Approve → real Linear issue (or queued / demo if keys missing)
5. Monday Morning Brief

## Brand assets

| Path | Notes |
|---|---|
| `public/brand/mark.svg` | Primary vector mark |
| `public/brand/explainer.mp4` | Landing atmosphere film |
