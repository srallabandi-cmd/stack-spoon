# Production runbook — 720p explainer (Higgsfield + Seedance)

Research date: **2026-08-06**. Sources: [Higgsfield Seedance help](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-seedance), [Higgsfield Seedance platforms blog](https://higgsfield.ai/blog/best-platforms-to-access-seedance-2-0), [fal.ai Seedance 2.0 API](https://fal.ai/models/bytedance/seedance-2.0/text-to-video/api), Higgsfield CLI skill docs (`higgsfield-generate`).

---

## 1. Exact workflow (2026)

### Path A — Higgsfield Web UI (recommended for this MVP)

1. Go to [higgsfield.ai](https://higgsfield.ai) → sign in (account + credits required).  
2. Open **Video** → select **Seedance 2.0** (use **Fast** for cheap drafts).  
3. For each scene in `04-higgsfield-seedance-prompts.md`:  
   - Paste prompt  
   - Set **aspect ratio 16:9**, **resolution 720p**, duration 5–12s as noted  
   - Iterate **without** native audio  
   - Generate → download MP4 into `clips/` as `scene-01.mp4` … `scene-08.mp4`  
4. Optional: image-to-video — generate a sharp still, then animate with Seedance for more predictable UI.  
5. For Hub continuity: last frame of 4a → start image of 4b.  
6. Record VO from `02-script.md` (Quiet / Descript / phone booth).  
7. Stitch in CapCut / DaVinci / Premiere **or** `scripts/stitch_720p.sh`.  
8. Burn on-screen supers; duck music; export **1280×720**, H.264, AAC, ~10–16 Mbps.

**720p dimensions:** **1280×720**, aspect **16:9**.

**Duration limits (Seedance on Higgsfield):** typically **4–15 seconds** per generation (plan/Unlimited tiers may cap at 8s or 15s). MVP scenes are **5–12s** each; full film is **stitched**, not one 60s generation.

**Credits tip:** Prototype 720p, no audio → lock prompt → final pass (+ optional audio). Unlimited Seedance Fast (if on plan) often web-only — CLI/MCP still spend credits.

### Path B — Higgsfield CLI / MCP (no public REST API)

Higgsfield **does not** expose a traditional public REST API. Programmatic access is **CLI / MCP** (credits apply):

```bash
# After: npm/pip install + higgsfield auth login
higgsfield generate create seedance_2_0 \
  --prompt "..." \
  --aspect_ratio 16:9 \
  --duration 8 \
  --wait
```

Inspect schema:

```bash
higgsfield model get seedance_2_0 --json
```

### Path C — fal.ai Seedance API (automation alternative)

If `FAL_KEY` is set (not Higgsfield):

- Endpoint: `bytedance/seedance-2.0/text-to-video`  
- Params: `prompt`, `resolution: "720p"`, `aspect_ratio: "16:9"`, `duration: "4"`…`"15"`  
- Auth: `FAL_KEY` env var  
- Good for batch scene jobs; still stitch locally for 60s film + VO

**This workspace (2026-08-06):** no `FAL_KEY`, no Higgsfield CLI, no Higgsfield session → **generation blocked on human login**.

---

## 2. Scene order & filenames

| File | Scene | Target trim |
|---|---|---|
| `clips/scene-01.mp4` | Pain | 0:00–0:08 |
| `clips/scene-02.mp4` | Bridge | 0:08–0:12 |
| `clips/scene-03.mp4` | Role Packs | 0:12–0:20 |
| `clips/scene-04a.mp4` | Connector Hub grid | 0:20–0:26 |
| `clips/scene-04b.mp4` | OAuth spoon-feed | 0:26–0:34 |
| `clips/scene-05.mp4` | HITL Inbox | 0:34–0:44 |
| `clips/scene-06.mp4` | Monday Brief | 0:44–0:54 |
| `clips/scene-08.mp4` | CTA | 0:54–1:02 |

---

## 3. Stitch to 1280×720 (ffmpeg)

```bash
cd "docs/video-mvp"
chmod +x scripts/stitch_720p.sh
./scripts/stitch_720p.sh
# → output/explainer-720p.mp4
```

Manual equivalent:

```bash
# After normalizing each clip to 1280x720 @ 24fps
ffmpeg -f concat -safe 0 -i scripts/concat-list.txt \
  -i assets/voiceover.wav -i assets/music.wav \
  -filter_complex "[1:a]volume=1.0[vo];[2:a]volume=0.18[mu];[vo][mu]amix=inputs=2:duration=first[a]" \
  -map 0:v -map "[a]" -c:v libx264 -pix_fmt yuv420p -r 24 \
  -c:a aac -b:a 192k -shortest output/explainer-720p.mp4
```

---

## 4. Editor checklist (CapCut / DaVinci)

- [ ] Timeline 16:9, 1280×720, 24 or 30 fps  
- [ ] Supers from `02-script.md` (never rely on Seedance text alone)  
- [ ] Hub labels readable: **Connect Slack**, **Connected**  
- [ ] No MCP / npx / JSON anywhere  
- [ ] VO peaks ~−6 dBFS; music under speech  
- [ ] End card holds ≥3s  
- [ ] Export H.264 + AAC, progressive, no letterbox  

---

## 5. Connector Hub accuracy (§8)

When regenerating Hub scenes, keep:

- Logo grid (“Apps at work”)  
- Buttons: **Connect Slack** (not “Add MCP server”)  
- OAuth consent → channel pick → Connected  
- MVP set: Slack · Calendar (Google/Outlook) · Granola/Zoom · Linear/Jira · Notion/Confluence  

---

## 6. Blocker & next human step

| Check | Status |
|---|---|
| Higgsfield account logged in (browser) | Required — not available to agent |
| Higgsfield CLI auth | Not installed / not configured |
| `FAL_KEY` | Not present in env |

**Interim artifact already in repo:** `output/explainer-storyboard-720p.mp4` — 1280×720 · ~64s still-frame slideshow (not Seedance motion). Use for stakeholder review while waiting on auth.

**Next human step:** Log into [higgsfield.ai](https://higgsfield.ai) (or set `FAL_KEY`), generate scenes using `04-higgsfield-seedance-prompts.md` (frames in `assets/` can be Seedance start images), drop MP4s into `clips/`, run `scripts/stitch_720p.sh`, add VO.

---

## 7. Optional static storyboard

If video gen is blocked, use frames in `assets/storyboard-*.png` as client review comps or as Seedance **start images** (image-to-video at 720p).
