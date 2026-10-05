#!/usr/bin/env bash
# Stack Spoon - human-touch explainer (dynamic Ken Burns + VO + fun music)
# Prefers edge-tts (warm neural voice); falls back to macOS Ava/Flo/Sandy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/../.." && pwd)"
ASSETS_SRC="${ASSETS_SRC:-$HOME/.cursor/projects/Users-siddharthrallabandi-Desktop-Vibe-Coding-agentic-ai-pm-agent/assets}"
OUT="$ROOT/output/human-touch"
WEB_OUT="$REPO/web/public/brand/explainer.mp4"
MUSIC_FILE="$ROOT/assets/music/fun-bed.mp3"
FPS=24
W=1280
H=720
EDGE_VOICE="${EDGE_VOICE:-en-US-AvaNeural}"
EDGE_RATE="${EDGE_RATE:-+5%}"
EDGE_PITCH="${EDGE_PITCH:-+2Hz}"
# macOS fallback - never Samantha
SAY_VOICE="${SAY_VOICE:-}"

mkdir -p "$OUT/frames" "$OUT/clips" "$OUT/supers" "$ROOT/assets/human-touch" "$ROOT/assets/music"
rm -rf "$OUT/clips"/* 2>/dev/null || true
rm -f "$OUT"/vo* "$OUT"/music* 2>/dev/null || true

need() { command -v "$1" >/dev/null || { echo "Missing $1"; exit 1; }; }
need ffmpeg
need ffprobe

if command -v python3.12 >/dev/null; then PY=python3.12; else PY=python3; fi
VENV="$OUT/.venv"
if [[ ! -x "$VENV/bin/python" ]]; then
  rm -rf "$VENV"
  "$PY" -m venv "$VENV"
fi
# Ensure pillow + edge-tts
"$VENV/bin/pip" install -q --upgrade pip >/dev/null
"$VENV/bin/pip" install -q pillow edge-tts
PYV="$VENV/bin/python"
EDGE_TTS="$VENV/bin/edge-tts"

# --- gather / copy frames ---
copy_frame() {
  local src="$1" dest="$2"
  if [[ -f "$src" ]]; then cp "$src" "$dest"; return 0; fi
  return 1
}

FRAMES=(
  "ss-frame-01-overwhelm.png"
  "ss-frame-02-touch.png"
  "ss-frame-03-choose.png"
  "ss-frame-04-connect.png"
  "ss-frame-05-approve.png"
  "ss-frame-06-monday.png"
  "ss-frame-07-heart.png"
)
i=0
for f in "${FRAMES[@]}"; do
  dest=$(printf "%s/frames/f%02d.png" "$OUT" "$i")
  if ! copy_frame "$ASSETS_SRC/$f" "$dest"; then
    if ! copy_frame "$ROOT/assets/human-touch/$f" "$dest"; then
      echo "Missing frame: $f (looked in $ASSETS_SRC and assets/human-touch)"
      exit 1
    fi
  fi
  cp "$dest" "$ROOT/assets/human-touch/$f"
  i=$((i+1))
done

# CTA end card with brand
export OUT
"$PYV" <<PY
from PIL import Image, ImageDraw, ImageFont
import os
out = "$OUT"
W, H = 1920, 1080
base = Image.new("RGBA", (W, H), (28, 32, 40, 255))
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy = W // 2, H // 2
for r in range(720, 0, -14):
    a = int(26 * (1 - r / 720))
    gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(70, 58, 48, a))
img = Image.alpha_composite(base, glow).convert("RGB")
d = ImageDraw.Draw(img)

def font(size, bold=False):
    for p in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
    ]:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def center(text, y, f, fill):
    bb = d.textbbox((0, 0), text, font=f)
    d.text(((W - (bb[2] - bb[0])) // 2, y), text, font=f, fill=fill)

center("Stack Spoon", 400, font(92, True), (245, 242, 236))
center("We hold your judgment with care.", 520, font(36), (196, 165, 116))
center("Start with your role", 640, font(28), (220, 218, 212))
path = os.path.join(out, "frames", "f07.png")
img.save(path)
print("cta", path)
PY

# supers (lower thirds) - match fun conversational VO
"$PYV" <<PY
from PIL import Image, ImageDraw, ImageFont
import os
work = "$OUT/supers"
os.makedirs(work, exist_ok=True)
W,H=1920,1080

def font(size, bold=False):
    for p in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: pass
    return ImageFont.load_default()

def make(name, line1, line2=None):
    img = Image.new("RGBA", (W,H), (0,0,0,0))
    d = ImageDraw.Draw(img)
    f1, f2 = font(48, True), font(30)
    bar_h = 130 if line2 else 88
    d.rounded_rectangle([40, H-bar_h-36, 1100, H-28], radius=16, fill=(16,18,22,200))
    d.text((72, H-bar_h-8), line1, font=f1, fill=(250,246,240,255))
    if line2:
        d.text((72, H-bar_h+50), line2, font=f2, fill=(196,165,116,255))
    img.save(os.path.join(work, name))

make("s00.png", "Hey - you weren't meant to", "carry the whole stack alone.")
make("s01.png", "Tools that don't talk.", "An AI that forgets by lunch.")
make("s02.png", "What if something remembered", "with you?")
make("s03.png", "Your role. Your pack.", "Meet the agent where you work.")
make("s04.png", "One friendly click.", "No jargon. No terminal.")
make("s05.png", "Agents draft. You decide.", "Approve what feels right.")
make("s06.png", "Monday morning,", "your brief is waiting.")
print("supers ok")
PY

# --- Conversational VO (~55-70s) ---
LINES=(
  "Hey - you weren't meant to carry the whole stack alone."
  "Every morning: tools that don't talk, a calendar that never sleeps, and an A.I. that forgets you by lunch."
  "What if something actually remembered with you? What if an agent met you where you work - and you still kept your hand on the wheel?"
  "Pick how you show up. Product. Program. Finance. Your role. Your pack."
  "Connect Slack, calendar, meetings - one friendly click. No jargon. No terminal."
  "Agents draft. You decide. Approve what feels right."
  "Monday morning, your brief is waiting - decisions, priorities, room to breathe."
  "Stack Spoon. We don't replace your judgment. We hold it with care. Start with your role."
)
# Extra breath between lines so music peeks through and total lands ~55-70s
GAPS=(1.4 1.25 1.35 1.2 1.3 1.35 1.45 2.0)

# Prefer edge-tts; fall back to macOS Ava / Flo / Sandy (not Samantha)
VOICE_USED=""
VOICE_ENGINE=""

synth_line_edge() {
  local idx="$1" text="$2" out_mp3="$3"
  "$EDGE_TTS" --voice "$EDGE_VOICE" --rate "$EDGE_RATE" --pitch "$EDGE_PITCH" \
    --text "$text" --write-media "$out_mp3" 2>/dev/null
}

pick_say_voice() {
  if [[ -n "$SAY_VOICE" ]]; then
    echo "$SAY_VOICE"
    return
  fi
  local v
  for v in Ava Flo Sandy; do
    if say -v "$v" " " >/dev/null 2>&1; then
      # Prefer US English variant when listed; say -v name works
      echo "$v"
      return
    fi
  done
  # Last resort among non-Samantha: Flo is commonly present on recent macOS
  echo "Flo"
}

USE_EDGE=0
if "$EDGE_TTS" --version >/dev/null 2>&1; then
  # Probe one short synth
  if synth_line_edge 999 "Stack Spoon." "$OUT/vo_probe.mp3"; then
    if [[ -s "$OUT/vo_probe.mp3" ]]; then
      USE_EDGE=1
      VOICE_USED="$EDGE_VOICE"
      VOICE_ENGINE="edge-tts"
      rm -f "$OUT/vo_probe.mp3"
    fi
  fi
fi

LIST_AUD="$OUT/vo_concat.txt"
: > "$LIST_AUD"

if [[ "$USE_EDGE" -eq 1 ]]; then
  echo "Using edge-tts voice=$EDGE_VOICE rate=$EDGE_RATE pitch=$EDGE_PITCH"
  for idx in "${!LINES[@]}"; do
    mp3="$OUT/vo_part_${idx}.mp3"
    if ! synth_line_edge "$idx" "${LINES[$idx]}" "$mp3" || [[ ! -s "$mp3" ]]; then
      echo "edge-tts failed on line $idx - falling back to macOS say"
      USE_EDGE=0
      break
    fi
    wav="$OUT/vo_part_${idx}.wav"
    ffmpeg -y -i "$mp3" -ar 48000 -ac 2 "$wav" 2>/dev/null
    echo "file '$wav'" >> "$LIST_AUD"
    sil="$OUT/vo_sil_${idx}.wav"
    ffmpeg -y -f lavfi -i "anullsrc=r=48000:cl=stereo" -t "${GAPS[$idx]}" "$sil" 2>/dev/null
    echo "file '$sil'" >> "$LIST_AUD"
  done
fi

if [[ "$USE_EDGE" -eq 0 ]]; then
  need say
  SAY_VOICE="$(pick_say_voice)"
  VOICE_USED="$SAY_VOICE"
  VOICE_ENGINE="macos-say"
  echo "Using macOS say voice=$SAY_VOICE (fallback)"
  : > "$LIST_AUD"
  for idx in "${!LINES[@]}"; do
    part="$OUT/vo_part_${idx}.aiff"
    # Slightly upbeat rate; Ava/Flo/Sandy feel warmer than Samantha
    say -v "$SAY_VOICE" -r 125 -o "$part" "${LINES[$idx]}"
    wav="$OUT/vo_part_${idx}.wav"
    ffmpeg -y -i "$part" -ar 48000 -ac 2 "$wav" 2>/dev/null
    echo "file '$wav'" >> "$LIST_AUD"
    sil="$OUT/vo_sil_${idx}.wav"
    ffmpeg -y -f lavfi -i "anullsrc=r=48000:cl=stereo" -t "${GAPS[$idx]}" "$sil" 2>/dev/null
    echo "file '$sil'" >> "$LIST_AUD"
  done
fi

ffmpeg -y -f concat -safe 0 -i "$LIST_AUD" -ar 48000 -ac 2 "$OUT/vo.wav" 2>/dev/null
VO_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/vo.wav")
echo "VO: ${VO_DUR}s engine=$VOICE_ENGINE voice=$VOICE_USED"
echo "$VOICE_ENGINE|$VOICE_USED" > "$OUT/voice_used.txt"

# --- Fun music bed ---
DUR_CEIL=$("$PYV" -c "import math; print(max(70, math.ceil(float('$VO_DUR')+2)))")
MUSIC_SOURCE="synthesized-ffmpeg-upbeat"

if [[ -f "$MUSIC_FILE" ]]; then
  echo "Using music file: $MUSIC_FILE"
  MUSIC_SOURCE="file:$MUSIC_FILE"
  if [[ -f "$ROOT/assets/music/fun-bed.source.txt" ]]; then
    MUSIC_SOURCE="file:$MUSIC_FILE ($(cat "$ROOT/assets/music/fun-bed.source.txt"))"
  fi
  # Loop/trim to length, light highpass for bed clarity, modest base volume (further ducked in mix)
  ffmpeg -y -stream_loop -1 -i "$MUSIC_FILE" -t "$DUR_CEIL" \
    -af "aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=80,lowpass=f=12000,volume=0.55,afade=t=in:st=0:d=1.5,afade=t=out:st=$( "$PYV" -c "print(max(0,float('$DUR_CEIL')-3))" ):d=3" \
    "$OUT/music.wav" 2>/dev/null
else
  echo "No $MUSIC_FILE - synthesizing musical upbeat bed (percussion + major chords)"
  MUSIC_SOURCE="synthesized-ffmpeg-upbeat"
  # Percussive pulses + major triad arps (C major feel) - better than flat sine pad
  ffmpeg -y \
    -f lavfi -i "sine=frequency=130.81:sample_rate=48000:duration=${DUR_CEIL}" \
    -f lavfi -i "sine=frequency=164.81:sample_rate=48000:duration=${DUR_CEIL}" \
    -f lavfi -i "sine=frequency=196.00:sample_rate=48000:duration=${DUR_CEIL}" \
    -f lavfi -i "sine=frequency=261.63:sample_rate=48000:duration=${DUR_CEIL}" \
    -f lavfi -i "sine=frequency=329.63:sample_rate=48000:duration=${DUR_CEIL}" \
    -f lavfi -i "anoisesrc=color=pink:sample_rate=48000:duration=${DUR_CEIL}" \
    -filter_complex "\
      [0:a]volume=0.12,lowpass=f=400[a0];\
      [1:a]volume=0.08,tremolo=f=2:d=0.6,lowpass=f=800[a1];\
      [2:a]volume=0.07,tremolo=f=4:d=0.5,bandpass=f=600:width_type=h:width=400[a2];\
      [3:a]volume=0.05,tremolo=f=1:d=0.4,highpass=f=200[a3];\
      [4:a]volume=0.04,tremolo=f=0.5:d=0.35[a4];\
      [5:a]volume=0.035,highpass=f=200,lowpass=f=2500,apulsator=mode=sine:hz=2[kick];\
      [a0][a1][a2][a3][a4][kick]amix=inputs=6:duration=longest:dropout_transition=2,volume=0.85,\
      afade=t=in:st=0:d=1.5,afade=t=out:st=$( "$PYV" -c "print(max(0,float('$DUR_CEIL')-3))" ):d=3[a]" \
    -map "[a]" -ac 2 "$OUT/music.wav" 2>/dev/null
fi
echo "$MUSIC_SOURCE" > "$OUT/music_source.txt"

# Scene durations proportional to VO (8 scenes: 7 photo + cta)
read -r D0 D1 D2 D3 D4 D5 D6 D7 <<EOF
$("$PYV" -c "
v=float('$VO_DUR')
w=[1.05,1.25,1.35,1.1,1.2,1.15,1.25,1.15]
s=sum(w)
vals=[round(v*x/s,2) for x in w]
vals[-1]=round(v-sum(vals[:-1]),2)
print(' '.join(str(x) for x in vals))
")
EOF
echo "durs: $D0 $D1 $D2 $D3 $D4 $D5 $D6 $D7"
DURS=("$D0" "$D1" "$D2" "$D3" "$D4" "$D5" "$D6" "$D7")
SUPERS=("s00.png" "s01.png" "s02.png" "s03.png" "s04.png" "s05.png" "s06.png" "")
ZENDS=(1.14 1.10 1.12 1.10 1.11 1.12 1.10 1.06)

build_clip() {
  local src="$1" super="$2" dur="$3" out="$4" zend="$5"
  local frames
  frames=$("$PYV" -c "print(int(round(float('$dur')*$FPS)))")
  if [[ -n "$super" && -f "$OUT/supers/$super" ]]; then
    ffmpeg -y -loop 1 -i "$src" -loop 1 -i "$OUT/supers/$super" -filter_complex "\
      [0:v]scale=4000:-1,zoompan=z='min(1.0+(${zend}-1.0)*on/${frames},${zend})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuva420p[base];\
      [1:v]scale=${W}:${H},format=yuva420p,fade=t=in:st=0.2:d=0.6:alpha=1[sup];\
      [base][sup]overlay=0:0:format=auto,format=yuv420p[v]" \
      -map "[v]" -t "$dur" -r "$FPS" -c:v libx264 -pix_fmt yuv420p -an "$out" 2>/dev/null
  else
    ffmpeg -y -loop 1 -i "$src" -vf "\
      scale=4000:-1,zoompan=z='min(1.0+(${zend}-1.0)*on/${frames},${zend})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p" \
      -t "$dur" -r "$FPS" -c:v libx264 -pix_fmt yuv420p -an "$out" 2>/dev/null
  fi
  echo "clip $(basename "$out") ${dur}s"
}

for i in 0 1 2 3 4 5 6 7; do
  src=$(printf "%s/frames/f%02d.png" "$OUT" "$i")
  out=$(printf "%s/clips/c%02d.mp4" "$OUT" "$i")
  build_clip "$src" "${SUPERS[$i]}" "${DURS[$i]}" "$out" "${ZENDS[$i]}"
done

LIST_VID="$OUT/vid_concat.txt"
: > "$LIST_VID"
for i in 0 1 2 3 4 5 6 7; do
  echo "file '$OUT/clips/c$(printf '%02d' $i).mp4'" >> "$LIST_VID"
done
ffmpeg -y -f concat -safe 0 -i "$LIST_VID" -c:v libx264 -pix_fmt yuv420p -r "$FPS" -an "$OUT/video_only.mp4" 2>/dev/null
VID_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/video_only.mp4")
echo "video: ${VID_DUR}s"

# Mix VO + ducked music (~-18dB under speech); asplit so VO can drive sidechain + mix
FADE_OUT=$("$PYV" -c "print(max(0, float('$VID_DUR')-2.5))")
rm -f "$OUT/stack-spoon-human-touch-720p.mp4"
set +e
ffmpeg -y -i "$OUT/video_only.mp4" -i "$OUT/vo.wav" -i "$OUT/music.wav" -filter_complex "\
  [1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.12,asplit=2[vo][vo_sc];\
  [2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.32,afade=t=in:st=0:d=1.5,afade=t=out:st=${FADE_OUT}:d=2.5[mu_raw];\
  [mu_raw][vo_sc]sidechaincompress=threshold=0.025:ratio=7:attack=25:release=400:makeup=1:mix=1[mu_ducked];\
  [vo][mu_ducked]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.95[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$OUT/stack-spoon-human-touch-720p.mp4"
MIX_RC=$?
set -e

# Static duck fallback (~-18dB under VO)
if [[ $MIX_RC -ne 0 || ! -s "$OUT/stack-spoon-human-touch-720p.mp4" ]]; then
  echo "sidechain mix failed (rc=$MIX_RC) - static duck fallback"
  ffmpeg -y -i "$OUT/video_only.mp4" -i "$OUT/vo.wav" -i "$OUT/music.wav" -filter_complex "\
    [1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.12[vo];\
    [2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.125,afade=t=in:st=0:d=1.5,afade=t=out:st=${FADE_OUT}:d=2.5[mu];\
    [vo][mu]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.95[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
    "$OUT/stack-spoon-human-touch-720p.mp4"
fi
[[ -s "$OUT/stack-spoon-human-touch-720p.mp4" ]] || { echo "FATAL: mix produced empty output"; exit 1; }

# Ensure moov-at-front for browser progressive playback
ffmpeg -y -i "$OUT/stack-spoon-human-touch-720p.mp4" -c copy -movflags +faststart "$WEB_OUT" 2>/dev/null
cp "$WEB_OUT" "$ROOT/output/stack-spoon-human-touch-720p.mp4"
echo "=== RESULT ==="
ffprobe -v error -show_entries stream=codec_type,codec_name -of csv=p=0 "$WEB_OUT"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$WEB_OUT"
ls -lh "$WEB_OUT" "$ROOT/output/stack-spoon-human-touch-720p.mp4"
echo "voice: $VOICE_ENGINE / $VOICE_USED"
echo "music: $MUSIC_SOURCE"
echo "DONE: $WEB_OUT"
