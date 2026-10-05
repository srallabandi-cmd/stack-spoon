#!/usr/bin/env bash
# Build Stack Spoon explainer locally (no Higgsfield / fal credentials).
# Uses storyboard PNGs + Ken Burns + macOS `say` VO + soft ambient bed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/assets"
OUT="$ROOT/output"
WORK="$OUT/local-build"
FPS=24
W=1280
H=720
VOICE="${VOICE:-Samantha}"
FINAL="$OUT/stack-spoon-explainer-local-720p.mp4"

mkdir -p "$WORK/clips" "$WORK/supers"
rm -f "$WORK/clips"/*.mp4 "$WORK"/vo.* "$WORK"/music.wav "$FINAL" 2>/dev/null || true

need() { command -v "$1" >/dev/null || { echo "Missing: $1"; exit 1; }; }
need ffmpeg
need say

# Prefer a working Homebrew Python (3.14 ensurepip is broken on some machines)
if command -v python3.12 >/dev/null 2>&1; then
  PY_SYS=python3.12
elif command -v python3 >/dev/null 2>&1; then
  PY_SYS=python3
else
  echo "Missing: python3"; exit 1
fi

# --- temp venv for Pillow (caption + bridge slate) ---
VENV="$WORK/.venv"
if [[ ! -x "$VENV/bin/python" ]]; then
  rm -rf "$VENV"
  "$PY_SYS" -m venv "$VENV"
  "$VENV/bin/pip" install -q pillow
fi
PY="$VENV/bin/python"

"$PY" <<'PY'
from PIL import Image, ImageDraw, ImageFont
import os

work = os.environ.get("WORK") or ""
assets = os.environ.get("ASSETS") or ""
# paths via argv-style env set below
PY

export WORK ASSETS
"$PY" <<'PY'
from PIL import Image, ImageDraw, ImageFont
import os

work = os.environ["WORK"]
assets = os.environ["ASSETS"]
W, H = 1920, 1080

def font(size, bold=False):
    for path in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

def make_bridge():
    base = Image.new("RGBA", (W, H), (28, 32, 40, 255))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = W // 2, H // 2
    for r in range(650, 0, -16):
        a = int(20 * (1 - r / 650))
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(55, 65, 80, a))
    img = Image.alpha_composite(base, glow).convert("RGB")
    d = ImageDraw.Draw(img)
    # subtle product shell
    d.rounded_rectangle([420, 260, 1500, 820], radius=18, outline=(90, 100, 115), width=2)
    d.rounded_rectangle([440, 300, 1480, 780], radius=12, fill=(36, 42, 52))
    title = "Stack Spoon"
    sub = "One OS for your role."
    tf, sf = font(72, True), font(44)
    for text, f, y, fill in [
        (title, tf, 420, (245, 246, 248)),
        (sub, sf, 520, (180, 186, 196)),
    ]:
        bb = d.textbbox((0, 0), text, font=f)
        d.text(((W - (bb[2] - bb[0])) // 2, y), text, font=f, fill=fill)
    path = os.path.join(assets, "storyboard-02-bridge.png")
    img.save(path, "PNG")
    print("bridge", path)

def make_super(filename, line1, line2=None):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f1, f2 = font(54, True), font(36)
    # bottom-left lower-third bar
    bar_h = 140 if line2 else 96
    d.rounded_rectangle([48, H - bar_h - 48, 980, H - 40], radius=14, fill=(18, 22, 28, 210))
    d.text((80, H - bar_h - 20), line1, font=f1, fill=(245, 246, 248, 255))
    if line2:
        d.text((80, H - bar_h + 48), line2, font=f2, fill=(170, 176, 186, 255))
    path = os.path.join(work, "supers", filename)
    img.save(path, "PNG")
    print("super", path)

make_bridge()
make_super("s01.png", "Too many tools.", "Too little context.")
make_super("s02.png", "One OS for your role.")
make_super("s03.png", "Choose your Role Pack")
make_super("s04a.png", "Connector Hub", "Connect Slack · Calendar · Linear · Notion")
make_super("s04b.png", "Connect Slack", "Sign in · pick channels · done")
make_super("s05.png", "Propose → Approve")
make_super("s06.png", "Monday Morning Brief")
# CTA has brand baked in - no super
PY

# --- Voiceover (macOS say) - slow + long beats to land near ~60s ---
TARGET_DUR=62
VO_AIFF_PARTS=()
i=0
# silence after each beat (seconds)
BEAT_GAPS=(1.2 0.9 1.0 1.4 1.0 1.2 1.5)
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  part="$WORK/vo_part_${i}.aiff"
  # -r ~110 WPM reads calmly; embedded rate as fallback
  say -v "$VOICE" -r 110 -o "$part" "$line"
  VO_AIFF_PARTS+=("$part")
  gap="${BEAT_GAPS[$i]:-1.0}"
  sil="$WORK/vo_sil_${i}.wav"
  ffmpeg -y -f lavfi -i "anullsrc=r=48000:cl=stereo" -t "$gap" "$sil" 2>/dev/null
  VO_AIFF_PARTS+=("$sil")
  i=$((i + 1))
done <<'EOF'
Your tools don't talk to each other. Your calendar is full. And every AI chat starts from zero.
There's a simpler way.
Start with a Role Pack - Product, Program, Finance, or S.M.B. - built for how you actually work.
Then open the Connector Hub. Connect Slack, Calendar, Granola, Linear, and Notion - one click each. Sign in, pick your channels, done.
Agents draft the work. You approve what ships.
Monday morning, your brief is ready - decisions, priorities, next moves.
Get early access. Start with your role.
EOF

LIST_AUD="$WORK/vo_concat.txt"
: > "$LIST_AUD"
for p in "${VO_AIFF_PARTS[@]}"; do
  base="$(basename "$p")"
  wav="$WORK/${base%.*}.wav"
  if [[ "$p" == *.wav ]]; then
    ffmpeg -y -i "$p" -ar 48000 -ac 2 "$wav" 2>/dev/null
  else
    ffmpeg -y -i "$p" -ar 48000 -ac 2 "$wav" 2>/dev/null
  fi
  echo "file '$wav'" >> "$LIST_AUD"
done
ffmpeg -y -f concat -safe 0 -i "$LIST_AUD" -ar 48000 -ac 2 "$WORK/vo_raw.wav" 2>/dev/null
RAW_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$WORK/vo_raw.wav")
# Pad VO to target so CTA isn't crushed
PAD=$("$PY_SYS" -c "print(max(0, round($TARGET_DUR - float('$RAW_DUR'), 2)))")
if "$PY_SYS" -c "exit(0 if float('$PAD') > 0.05 else 1)"; then
  ffmpeg -y -f lavfi -i "anullsrc=r=48000:cl=stereo" -t "$PAD" "$WORK/vo_pad.wav" 2>/dev/null
  printf "file '%s'\nfile '%s'\n" "$WORK/vo_raw.wav" "$WORK/vo_pad.wav" > "$WORK/vo_pad_concat.txt"
  ffmpeg -y -f concat -safe 0 -i "$WORK/vo_pad_concat.txt" -ar 48000 -ac 2 "$WORK/vo.wav" 2>/dev/null
else
  cp "$WORK/vo_raw.wav" "$WORK/vo.wav"
fi
VO_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$WORK/vo.wav")
echo "VO duration: ${VO_DUR}s (raw=${RAW_DUR}s, voice=$VOICE)"

# --- Soft ambient bed (no external music files) ---
# Warm low pad + gentle high shimmer, ~VO length + 1s
DUR_CEIL=$("$PY_SYS" -c "import math; print(max(64, math.ceil(float('$VO_DUR') + 1)))")
ffmpeg -y -f lavfi -i "sine=frequency=110:sample_rate=48000:duration=${DUR_CEIL}" \
  -f lavfi -i "sine=frequency=164.81:sample_rate=48000:duration=${DUR_CEIL}" \
  -f lavfi -i "sine=frequency=246.94:sample_rate=48000:duration=${DUR_CEIL}" \
  -filter_complex "\
    [0:a]volume=0.12,lowpass=f=400[a0];\
    [1:a]volume=0.08,lowpass=f=600[a1];\
    [2:a]volume=0.04,highpass=f=200,lowpass=f=2000,tremolo=f=0.15:d=0.4[a2];\
    [a0][a1][a2]amix=inputs=3:duration=longest:dropout_transition=2,volume=0.55[a]\
  " -map "[a]" -ac 2 "$WORK/music.wav" 2>/dev/null

# --- Ken Burns clip builder ---
# Args: input.png super.png duration_s outfile zoom_end x_expr y_expr
build_clip() {
  local src="$1" super="$2" dur="$3" out="$4" zend="$5"
  local frames
  frames=$("$PY_SYS" -c "print(int(round(float('$dur') * $FPS)))")
  # Scale up then zoompan for smooth Ken Burns
  if [[ -n "$super" && -f "$super" ]]; then
    ffmpeg -y -loop 1 -i "$src" -loop 1 -i "$super" -filter_complex "\
      [0:v]scale=3600:-1,zoompan=z='min(1.0+(${zend}-1.0)*on/${frames}, ${zend})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuva420p[base];\
      [1:v]scale=${W}:${H},format=yuva420p[sup];\
      [base][sup]overlay=0:0:format=auto,format=yuv420p[v]\
    " -map "[v]" -t "$dur" -r "$FPS" -c:v libx264 -pix_fmt yuv420p -an "$out" 2>/dev/null
  else
    ffmpeg -y -loop 1 -i "$src" -vf "\
      scale=3600:-1,zoompan=z='min(1.0+(${zend}-1.0)*on/${frames}, ${zend})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p\
    " -t "$dur" -r "$FPS" -c:v libx264 -pix_fmt yuv420p -an "$out" 2>/dev/null
  fi
  echo "clip $(basename "$out") ${dur}s"
}

# Script beat timings (floors), scaled to VO with CTA ≥ 6s
read -r S1 S2 S3 S4A S4B S5 S6 S8 <<EOF
$("$PY_SYS" -c "
v=float('$VO_DUR')
base=[8.0,4.0,8.0,7.0,7.0,10.0,10.0,8.0]
floors=[6.0,3.0,6.0,5.5,5.5,7.0,7.0,6.0]
s=sum(base)
scale=v/s
vals=[max(f, round(b*scale, 2)) for b,f in zip(base, floors)]
# If floors overshoot, shrink middle scenes (not CTA)
over=sum(vals)-v
if over > 0.05:
    shrinkable=[1,2,3,4,5]  # bridge..monday indexes into vals? use 2..6
    for idx in [2,3,4,5,6,1]:
        if over <= 0: break
        room=vals[idx]-floors[idx]
        cut=min(room, over)
        vals[idx]=round(vals[idx]-cut, 2)
        over=round(over-cut, 2)
vals[-1]=round(v-sum(vals[:-1]), 2)
if vals[-1] < floors[-1]:
    # pull from hub/hitl
    need=floors[-1]-vals[-1]
    for idx in [4,3,5,6]:
        if need <= 0: break
        room=vals[idx]-floors[idx]
        cut=min(room, need)
        vals[idx]=round(vals[idx]-cut, 2)
        need=round(need-cut, 2)
    vals[-1]=round(v-sum(vals[:-1]), 2)
print(' '.join(str(x) for x in vals))
")
EOF
echo "Scene durations: $S1 $S2 $S3 $S4A $S4B $S5 $S6 $S8"

build_clip "$ASSETS/storyboard-01-pain.png"            "$WORK/supers/s01.png"  "$S1"  "$WORK/clips/c01.mp4" 1.12
build_clip "$ASSETS/storyboard-02-bridge.png"          "$WORK/supers/s02.png"  "$S2"  "$WORK/clips/c02.mp4" 1.06
build_clip "$ASSETS/storyboard-03-role-packs.png"      "$WORK/supers/s03.png"  "$S3"  "$WORK/clips/c03.mp4" 1.10
build_clip "$ASSETS/storyboard-04a-connector-hub.png"  "$WORK/supers/s04a.png" "$S4A" "$WORK/clips/c04a.mp4" 1.08
build_clip "$ASSETS/storyboard-04b-oauth.png"          "$WORK/supers/s04b.png" "$S4B" "$WORK/clips/c04b.mp4" 1.10
build_clip "$ASSETS/storyboard-05-hitl-inbox.png"      "$WORK/supers/s05.png"  "$S5"  "$WORK/clips/c05.mp4" 1.10
build_clip "$ASSETS/storyboard-06-monday-brief.png"    "$WORK/supers/s06.png"  "$S6"  "$WORK/clips/c06.mp4" 1.12
build_clip "$ASSETS/storyboard-08-cta.png"             ""                      "$S8"  "$WORK/clips/c08.mp4" 1.05

# --- Concat (hard cuts keep VO sync; Ken Burns provides motion) ---
LIST_VID="$WORK/vid_concat.txt"
: > "$LIST_VID"
for c in c01 c02 c03 c04a c04b c05 c06 c08; do
  echo "file '$WORK/clips/${c}.mp4'" >> "$LIST_VID"
done
ffmpeg -y -f concat -safe 0 -i "$LIST_VID" -c:v libx264 -pix_fmt yuv420p -r "$FPS" -an \
  "$WORK/video_only.mp4" 2>/dev/null

VID_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$WORK/video_only.mp4")
echo "Video duration: ${VID_DUR}s"

# Mix: VO at full, music ducked ~-18dB under VO
ffmpeg -y -i "$WORK/video_only.mp4" -i "$WORK/vo.wav" -i "$WORK/music.wav" -filter_complex "\
  [1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0[vo];\
  [2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.18,afade=t=in:st=0:d=1.5,afade=t=out:st=$("$PY_SYS" -c "print(max(0,float('$VID_DUR')-2))"):d=2[mu];\
  [vo][mu]amix=inputs=2:duration=first:dropout_transition=2[a]\
" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$FINAL" 2>/dev/null

ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$FINAL"
ls -lh "$FINAL"
echo "DONE: $FINAL"
