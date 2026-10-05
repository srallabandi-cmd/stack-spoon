# Soft Launch design-partner playbook

**Target:** 5–15 AI PMs or operators who already live in Slack + Linear.

## Pitch (one sentence)

Stack Spoon installs a Role Pack, reads Slack, lets you Approve agent proposals, and writes Linear only after you say so.

## Recruit

1. Point people to `/invite` then `/contact` with **design partner** checked.
2. After they email, send a magic-link invite and a 15-minute walkthrough.
3. Beachhead pack: **AI-PM**. Early Stage only if they are a 1–10 founder team.
4. Cap at 15 until the write loop is boringly reliable.

## Weekly pivot gate (every Friday)

Ask:

- Did Approve create a real Linear issue this week?
- Was Slack context actually useful in Inbox, or noise?
- Wrong pack? Switch AI-PM vs Early Stage.
- Wrong write SoR? Linear vs Notion (do not add Notion until Linear is sticky).

## Instrument (already logged server-side)

Events: `connect`, `propose`, `write` in the workspace database.

Success for a partner: connect Slack + Linear → propose → approve → `write` with a real identifier.

## Do not

- Promise Inbox-in-Slack, overnight email, or 20 live packs
- Un-label Preview tiles
- Onboard people whose SoR is Jira-only until we pivot
