# Customer explainer video — MVP brief

**Brand (locked):** **Stack Spoon**  
**Status:** Prompt pack + runbook ready. Interim **1280×720 storyboard slideshow** at `output/explainer-storyboard-720p.mp4` (static frames). Motion Seedance clips blocked until Higgsfield login (or fal.ai `FAL_KEY`).  
**Output target:** 1280×720 (16:9), H.264 `.mp4`  
**Length:** 45–75 seconds (MVP sweet spot: **60–65s**)  
**Platform:** Higgsfield web UI → Seedance 2.0 (primary); fal.ai Seedance API (optional automation path)

---

## Audience

| Segment | Who | What they need to feel |
|---|---|---|
| Primary | AI / product managers at Series A–C | “This ends my tool sprawl and Monday scramble.” |
| Secondary | Heads of Product / program leads evaluating ops tools | “Role packs fit my team without another DIY agent stack.” |
| Tertiary | Founders / SMB ops (Phase-4 SKU preview) | “I can start with my role and approve everything.” |

**Buyer literacy:** Non-technical. Never say MCP, gateway, stdio, or “agent fleet.” Show logos, **Connect Slack**, OAuth consent, Approve, and a Monday brief.

---

## One-sentence message

Install a **Role Pack**, connect the apps you already use in the **Connector Hub**, let agents **propose** work in an Inbox you control — wake up to a **Monday Morning brief** instead of re-briefing AI from scratch.

---

## Narrative arc (must cover)

1. **Pain** — Tool sprawl, meeting overload, re-briefing AI every session  
2. **Role Packs** — Pick PM / Program / Finance / SMB  
3. **Connector Hub (§8 locked)** — Visual logo grid; **Connect Slack** (and peers); OAuth spoon-feed; no MCP jargon  
4. **HITL Inbox** — Agent proposes → human Approves  
5. **Outcome** — Monday Morning brief ready  
6. **CTA** — Get early access / Start with your role  

### Connector Hub visuals (locked for video)

Show an **“Apps at work”** grid — not a developer settings panel.

| Show on screen | Never show |
|---|---|
| Logos + **Connect Slack**, **Connect Calendar**, etc. | “MCP server,” stdio, JSON config, `npx` |
| OAuth consent → channel/calendar pick → **Connected** | Paste server URL / Bearer token as primary path |
| Status chips: Connected / Needs attention | Raw scope machine names |

**MVP connector set to feature (pick one per row for clarity):**

| Category | Show in video |
|---|---|
| Chat | **Slack** |
| Calendar | **Google Calendar** *or* **Outlook** |
| Meetings | **Granola** *or* **Zoom** |
| Tickets | **Linear** *or* **Jira** |
| Docs | **Notion** *or* **Confluence** |

**Recommended hero set for one clean shot:** Slack · Google Calendar · Granola · Linear · Notion  
(Alternate cut: Slack · Outlook · Zoom · Jira · Confluence)

**OAuth spoon-feed beat (2–3s inside Hub scene):** Click **Connect Slack** → familiar Slack consent → pick channels → green **Connected**. Same pattern implied for the rest of the grid.

---

## Brand & visual tone

- Clear, calm, professional product metaphor  
- **Avoid:** purple glow, neon AI cliché, floating holograms, chaotic cyber dashboards  
- **Palette:** cool slate / soft blue-gray UI; warm daylight desk for bookends; charcoal text; single teal or slate accent for Connect / Approve  
- **Metaphor sequence:** cluttered tools → role picker → Connector Hub (OAuth) → inbox approvals → calm Monday brief  

---

## Success criteria (MVP)

- [ ] Viewer can retell the product in one sentence after one watch  
- [ ] No MCP / technical jargon on screen or VO  
- [ ] Connector Hub clearly reads as logo grid + Connect + OAuth (not “integrations for developers”)  
- [ ] Final export is **1280×720**, ~60s, with VO + soft ambient  
- [ ] CTA end card readable for ≥3 seconds  

---

## Deliverables in this folder

| File | Purpose |
|---|---|
| `01-brief.md` | This brief |
| `02-script.md` | Timed VO + on-screen text |
| `03-storyboard.md` | 8 scenes with visual + prompt notes |
| `04-higgsfield-seedance-prompts.md` | Copy-paste Seedance prompts |
| `05-production-runbook.md` | Research workflow + stitch/export steps |
| `scripts/stitch_720p.sh` | ffmpeg concat → 1280×720 |
| `assets/` | Static storyboard frames |
| `clips/` | Downloaded Seedance scene clips |
