#!/usr/bin/env bash
# Rebuild explainer with edge-tts (Ava) + fun music bed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPO="$(cd "$ROOT/../.." && pwd 2>/dev/null || true)"
# ROOT is docs/video-mvp when script lives in scripts/
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/../.." && pwd)"
OUT="$ROOT/output/human-touch"
WEB_OUT="$REPO/web/public/brand/explainer.mp4"
MUSIC="$ROOT/assets/music/fun-bed.mp3"
FPS=24
W=1280
H=720
VOICE="${EDGE_VOICE:-en-US-AvaNeural}"
EDGE="${EDGE_BIN:-/tmp/ss-tts-venv/bin/edge-tts}"

mkdir -p "$OUT/clips" "$OUT/frames" "$ROOT/assets/music" "$ROOT/assets/human-touch"

if [[ ! -x "$EDGE" ]]; then
  python3.12 -m venv /tmp/ss-tts-venv
  /tmp/ss-tts-venv/bin/pip install -q edge-tts
  EDGE=/tmp/ss-tts-venv/bin/edge-tts
fi

if [[ ! -f "$MUSIC" ]]; then
  curl -L --fail --max-time 60 -o "$MUSIC" \
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
fi

# Ensure frames exist from prior human-touch build
ASSETS_SRC="${ASSETS_SRC:-$HOME/.cursor/projects/Users-siddharthrallabandi-Desktop-Vibe-Coding-agentic-ai-pm-agent/assets}"
for i in 01 02 03 04 05 06 07; do
  src="$ASSETS_SRC/ss-frame-${i}-"*.png
  # map known names
  case "$i" in
    01) name=ss-frame-01-overwhelm.png ;;
    02) name=ss-frame-02-touch.png ;;
    03) name=ss-frame-03-choose.png ;;
    04) name=ss-frame-04-connect.png ;;
    05) name=ss-frame-05-approve.png ;;
    06) name=ss-frame-06-monday.png ;;
    07) name=ss-frame-07-heart.png ;;
  esac
  idx=$((10#$i - 1))
  dest=$(printf "%s/frames/f%02d.png" "$OUT" "$idx")
  if [[ -f "$ROOT/assets/human-touch/$name" ]]; then
    cp "$ROOT/assets/human-touch/$name" "$dest"
  elif [[ -f "$ASSETS_SRC/$name" ]]; then
    cp "$ASSETS_SRC/$name" "$dest"
    cp "$ASSETS_SRC/$name" "$ROOT/assets/human-touch/$name"
  elif [[ -f "$dest" ]]; then
    :
  else
    echo "Missing frame $name"; exit 1
  fi
done

# CTA frame if missing
if [[ ! -f "$OUT/frames/f07.png" ]]; then
  if command -v python3.12 >/dev/null; then PY=python3.12; else PY=python3; fi
  VENV="$OUT/.venv"
  [[ -x "$VENV/bin/python" ]] || { "$PY" -m venv "$VENV"; "$VENV/bin/pip" install -q pillow; }
  "$VENV/bin/python" - <<PY
from PIL import Image, ImageDraw, ImageFont
import os
out="$OUT/frames/f07.png"
W,H=1920,1080
img=Image.new("RGB",(W,H),(28,32,40))
d=ImageDraw.Draw(img)
try:
  f=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 92)
  f2=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 36)
except Exception:
  f=f2=ImageFont.load_default()
def center(t,y,font,fill):
  bb=d.textbbox((0,0),t,font=font); d.text(((W-(bb[2]-bb[0]))//2,y),t,font=font,fill=fill)
center("Stack Spoon",400,f,(245,242,236))
center("We hold your judgment with care.",520,f2,(196,165,116))
center("Start with your role",640,f2,(220,218,212))
img.save(out)
PY
fi

# --- VO via edge-tts ---
rm -f "$OUT"/edge_*.mp3 "$OUT"/edge_*.wav "$OUT"/sil_*.wav "$OUT"/vo_fun.wav
LIST="$OUT/vo_concat.txt"
: > "$LIST"

VO_TXT="$OUT/vo_lines.txt"
cat > "$VO_TXT" <<'EOF'
Hey. You weren't meant to carry the whole stack alone.
Every morning: tools that don't talk, a calendar that never sleeps, and an A.I. that forgets you by lunch.
What if something actually remembered with you?
What if an agent met you where you work, and you still kept your hand on the wheel?
Pick how you show up. Product. Program. Finance. Your role. Your pack.
Connect Slack, calendar, meetings: one friendly click. No jargon. No terminal.
Agents draft. You decide. Approve what feels right.
Monday morning, your brief is waiting: decisions, priorities, room to breathe.
Stack Spoon. We don't replace your judgment. We hold it with care. Start with your role.
EOF

i=0
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  mp3="$OUT/edge_${i}.mp3"
  wav="$OUT/edge_${i}.wav"
  echo "TTS [$i]: $line"
  "$EDGE" --voice "$VOICE" --rate="+10%" --pitch="+3Hz" --text "$line" --write-media "$mp3"
  ffmpeg -y -i "$mp3" -ar 48000 -ac 2 "$wav" 2>/dev/null
  echo "file '$wav'" >> "$LIST"
  gap=0.38
  if [[ $i -eq 0 || $i -eq 2 || $i -eq 7 ]]; then gap=0.55; fi
  sil="$OUT/sil_${i}.wav"
  ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=stereo -t "$gap" "$sil" 2>/dev/null
  echo "file '$sil'" >> "$LIST"
  i=$((i+1))
done < "$VO_TXT"

ffmpeg -y -f concat -safe 0 -i "$LIST" -ar 48000 -ac 2 "$OUT/vo_fun.wav" 2>/dev/null
VO_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/vo_fun.wav")
echo "VO duration: ${VO_DUR}s ($VOICE)"

# Prepare music: trim/loop to VO length, light highpass, volume later in mix
ffmpeg -y -stream_loop -1 -i "$MUSIC" -t "$(python3.12 -c "print(float('$VO_DUR')+1.5)")" \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,volume=0.55" -ar 48000 -ac 2 "$OUT/music_fun.wav" 2>/dev/null

# Build / reuse Ken Burns clips - 8 scenes weighted to VO
read -r D0 D1 D2 D3 D4 D5 D6 D7 <<EOF
$(python3.12 -c "
v=float('$VO_DUR')
w=[1.0,1.15,0.85,1.15,1.1,1.0,1.15,1.2]
s=sum(w)
vals=[round(v*x/s,2) for x in w]
vals[-1]=round(v-sum(vals[:-1]),2)
print(' '.join(str(x) for x in vals))
")
EOF
DURS=("$D0" "$D1" "$D2" "$D3" "$D4" "$D5" "$D6" "$D7")
ZENDS=(1.12 1.10 1.11 1.10 1.10 1.11 1.10 1.05)
echo "Scene durs: ${DURS[*]}"

if command -v python3.12 >/dev/null; then PY=python3.12; else PY=python3; fi
VENV="$OUT/.venv"
[[ -x "$VENV/bin/python" ]] || { "$PY" -m venv "$VENV"; "$VENV/bin/pip" install -q pillow; }
PYV="$VENV/bin/python"

export OUT
"$PYV" <<'PY'
from PIL import Image, ImageDraw, ImageFont
import os
work=os.environ["OUT"]+"/supers"
os.makedirs(work, exist_ok=True)
W,H=1920,1080
def font(size, bold=False):
  for p in ["/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"]:
    if os.path.exists(p):
      try: return ImageFont.truetype(p,size)
      except: pass
  return ImageFont.load_default()
def make(name,l1,l2=None):
  img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
  f1,f2=font(46,True),font(28); h=120 if l2 else 84
  d.rounded_rectangle([40,H-h-36,1080,H-28],radius=16,fill=(16,18,22,200))
  d.text((72,H-h-6),l1,font=f1,fill=(250,246,240,255))
  if l2: d.text((72,H-h+48),l2,font=f2,fill=(196,165,116,255))
  img.save(os.path.join(work,name))
make("s00.png","Hey. You weren't meant to carry it alone.")
make("s01.png","Tools that don't talk.","An AI that forgets by lunch.")
make("s02.png","What if something remembered with you?")
make("s03.png","Your role. Your pack.")
make("s04.png","One friendly click.","No jargon. No terminal.")
make("s05.png","Agents draft. You decide.")
make("s06.png","Monday is waiting.","Room to breathe.")
print("supers ok")
PY

SUPERS=(s00.png s01.png s02.png s03.png s04.png s05.png s06.png "")
rm -f "$OUT"/clips/*.mp4
for i in 0 1 2 3 4 5 6 7; do
  src=$(printf "%s/frames/f%02d.png" "$OUT" "$i")
  outc=$(printf "%s/clips/c%02d.mp4" "$OUT" "$i")
  dur="${DURS[$i]}"
  zend="${ZENDS[$i]}"
  frames=$(python3.12 -c "print(int(round(float('$dur')*$FPS)))")
  super="${SUPERS[$i]}"
  if [[ -n "$super" && -f "$OUT/supers/$super" ]]; then
    ffmpeg -y -loop 1 -i "$src" -loop 1 -i "$OUT/supers/$super" -filter_complex "\
      [0:v]scale=4000:-1,zoompan=z='min(1.0+(${zend}-1.0)*on/${frames},${zend})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuva420p[base];\
      [1:v]scale=${W}:${H},format=yuva420p,fade=t=in:st=0.15:d=0.5:alpha=1[sup];\
      [base][sup]overlay=0:0:format=auto,format=yuv420p[v]" \
      -map "[v]" -t "$dur" -r "$FPS" -c:v libx264 -pix_fmt yuv420p -an "$outc" 2>/dev/null
  else
    ffmpeg -y -loop 1 -i "$src" -vf "\
      scale=4000:-1,zoompan=z='min(1.0+(${zend}-1.0)*on/${frames},${zend})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p" \
      -t "$dur" -r "$FPS" -c:v libx264 -pix_fmt yuv420p -an "$outc" 2>/dev/null
  fi
  echo "clip c$(printf '%02d' $i) ${dur}s"
done

LISTV="$OUT/vid_concat.txt"
: > "$LISTV"
for i in 0 1 2 3 4 5 6 7; do
  echo "file '$OUT/clips/c$(printf '%02d' $i).mp4'" >> "$LISTV"
done
ffmpeg -y -f concat -safe 0 -i "$LISTV" -c:v libx264 -pix_fmt yuv420p -r "$FPS" -an "$OUT/video_only.mp4" 2>/dev/null
VID_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/video_only.mp4")
FADE=$(python3.12 -c "print(max(0,float('$VID_DUR')-2.5))")

# Mix: VO loud + fun music ducked, sidechain-ish via volume
ffmpeg -y -i "$OUT/video_only.mp4" -i "$OUT/vo_fun.wav" -i "$OUT/music_fun.wav" -filter_complex "\
  [1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.25[vo];\
  [2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.22,afade=t=in:st=0:d=1.2,afade=t=out:st=${FADE}:d=2.2[mu];\
  [vo][mu]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.95[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$OUT/stack-spoon-human-touch-720p.mp4" 2>/dev/null

# Ensure moov-at-front for browser progressive playback
ffmpeg -y -i "$OUT/stack-spoon-human-touch-720p.mp4" -c copy -movflags +faststart "$WEB_OUT" 2>/dev/null
cp "$WEB_OUT" "$ROOT/output/stack-spoon-human-touch-720p.mp4"
ffprobe -v error -show_entries stream=codec_type,codec_name -of csv=p=0 "$WEB_OUT"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$WEB_OUT"
ls -lh "$WEB_OUT"
echo "DONE voice=$VOICE music=$MUSIC"
