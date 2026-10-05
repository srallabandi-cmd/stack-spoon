# Copy-paste Seedance prompts (Higgsfield)

**Global settings (every clip)**  
- Model: **Seedance 2.0** (or Seedance 2.0 Fast for cheap drafts)  
- Aspect ratio: **16:9**  
- Resolution: **720p**  
- Duration: as noted per scene  
- Bitrate: standard while iterating; high for finals  
- Audio: **off** while iterating; optional native ambient on final pass (VO still recorded separately)  
- Style suffix (append to every prompt):

```
Photoreal product marketing shot, calm professional SaaS aesthetic, cool slate and soft blue-gray UI, warm natural daylight accents, sharp readable interface text, no purple neon, no holographic AI brains, no cyberpunk, no glowing particles, cinematic shallow depth of field, smooth controlled camera.
```

**Prompt structure (Higgsfield guidance):** subject/action → setting/lighting → camera → mood.

---

## Scene 1 — Pain (8s)

```
Overhead shot of a busy product manager desk: open laptop covered in overlapping messy app windows for chat, tickets, docs, and calendar, smartphone showing unread message badges, sticky notes and coffee cup, afternoon office light, slow dolly push-in, tense but realistic workplace clutter, quiet ambient office atmosphere.
```

**On-screen burn-in (add in editor):** Too many tools. Too little context.

---

## Scene 2 — Bridge (5s)

```
Same product manager desk clearing to a single centered browser window with a calm clean slate SaaS dashboard, soft daylight through a window, camera eases back to a composed medium shot, sense of relief and clarity, minimal UI chrome, professional product demo look.
```

**On-screen:** One OS for your role.

---

## Scene 3 — Role Packs (8s)

```
Full-bleed SaaS product UI, light slate background, four clean role cards labeled Product Manager, Program, Finance, and SMB in a neat grid, cursor selects the Product Manager card which gently elevates with a soft shadow, a subtle Get this pack button appears, slow dolly in, crisp typography, calm professional product marketing video.
```

**On-screen:** Choose your Role Pack

---

## Scene 4a — Connector Hub grid (8s)

```
Full-bleed SaaS Connector Hub screen titled Apps, five app tiles in a clean logo grid for Slack, Google Calendar, Granola, Linear, and Notion, each tile shows a clear Connect button with labels Connect Slack, Connect Calendar, Connect Granola, Connect Linear, Connect Notion, status chips say Not connected, soft slate UI, slow horizontal pan across the grid, one-click app directory look, no terminals, no code, no developer settings.
```

**On-screen:** Connector Hub

---

## Scene 4b — OAuth spoon-feed (8s)

```
Close-up of a Slack tile in a SaaS Connector Hub, cursor clicks Connect Slack, a clean OAuth consent modal appears with Allow access, then a simple channel picker highlighting product and eng channels, the Slack tile flips to a calm green Connected checkmark, neighboring Calendar Granola Linear Notion tiles quickly flip to Connected, soft UI animation, professional product demo, no MCP text, no API keys, no JSON, no terminal windows.
```

**On-screen:** Connect Slack → Connected

---

## Scene 4 alternate (Atlassian-leaning grid)

```
Full-bleed SaaS Connector Hub, five app tiles for Slack, Outlook, Zoom, Jira, and Confluence, each with Connect buttons labeled Connect Slack, Connect Outlook, Connect Zoom, Connect Jira, Connect Confluence, cursor completes an OAuth allow flow on Slack then tiles cascade to Connected, calm slate UI, slow push-in, product marketing clarity.
```

---

## Scene 5 — HITL Inbox (8s)

```
SaaS human-in-the-loop Inbox UI, list of agent proposal cards including Draft Monday decisions and Propose Linear tickets and Slack update pending approval, focus on one proposal card with Preview, a cursor firmly clicks a clear Approve button, status changes to Approved with a subtle check, cool slate interface, slow push-in, trustworthy calm product demo.
```

**On-screen:** Propose → Approve

---

## Scene 6 — Monday Morning brief (8s)

```
Morning window light on a laptop on a tidy desk, screen shows a Monday Morning Brief document with sections Decisions, Priorities, and Next moves in short readable bullets, small footer badges implying Slack Granola Linear, gentle camera push-in, peaceful resolved mood, photoreal workplace, professional SaaS outcome shot.
```

**On-screen:** Monday Morning Brief

---

## Scene 8 — CTA end card (6s)

```
Clean end card on a soft slate gradient, centered product title Stack Spoon, supporting line Agents propose. You approve., two calm rectangular buttons labeled Get early access and Start with your role, subtle ambient light drift only, no particles, no neon, premium B2B brand finish, 16:9 composition with generous margins.
```

---

## Negative / avoid (paste into negative prompt if UI offers it)

```
purple glow, neon, cyberpunk, holographic brain, floating particles, cluttered dashboard widgets, MCP, JSON config, terminal, npx, API key paste screen, comic exaggeration, distorted text, watermark, low-res UI
```

---

## Consistency tips (Higgsfield)

1. Prototype each scene at **720p / no audio** first.  
2. For Hub continuity, generate Scene 4a, export a still of the final frame, use as **start image** for Scene 4b.  
3. Keep UI labels short: Connect Slack / Connected / Approve.  
4. If logos look wrong, prefer stylized generic app icons with correct color cues over warped trademark marks; fix logos in post if needed.  
5. Do **not** put long VO text in the Seedance prompt — burn supers in CapCut/Premiere/DaVinci.  
