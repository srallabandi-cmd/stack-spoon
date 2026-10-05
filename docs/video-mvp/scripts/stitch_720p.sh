#!/usr/bin/env bash
# Stitch Seedance scene clips → 1280x720 explainer.
# Usage: from docs/video-mvp/  →  ./scripts/stitch_720p.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLIPS="$ROOT/clips"
OUT="$ROOT/output"
NORM="$OUT/normalized"
LIST="$OUT/concat-list.txt"

mkdir -p "$OUT" "$NORM"

need=(
  scene-01.mp4
  scene-02.mp4
  scene-03.mp4
  scene-04a.mp4
  scene-04b.mp4
  scene-05.mp4
  scene-06.mp4
  scene-08.mp4
)

missing=0
for f in "${need[@]}"; do
  if [[ ! -f "$CLIPS/$f" ]]; then
    echo "Missing: clips/$f"
    missing=1
  fi
done
if [[ "$missing" -eq 1 ]]; then
  echo "Place all scene MP4s in clips/ then re-run."
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install: brew install ffmpeg"
  exit 1
fi

: > "$LIST"
for f in "${need[@]}"; do
  base="${f%.mp4}"
  ffmpeg -y -i "$CLIPS/$f" \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fps=24,format=yuv420p" \
    -an -c:v libx264 -preset fast -crf 18 \
    "$NORM/${base}.mp4"
  echo "file '$NORM/${base}.mp4'" >> "$LIST"
done

VIDEO_ONLY="$OUT/explainer-video-only-720p.mp4"
ffmpeg -y -f concat -safe 0 -i "$LIST" -c:v libx264 -pix_fmt yuv420p -r 24 -an \
  "$VIDEO_ONLY"

FINAL="$OUT/explainer-720p.mp4"
if [[ -f "$ROOT/assets/voiceover.wav" || -f "$ROOT/assets/voiceover.mp3" ]]; then
  VO="$ROOT/assets/voiceover.wav"
  [[ -f "$VO" ]] || VO="$ROOT/assets/voiceover.mp3"
  if [[ -f "$ROOT/assets/music.wav" || -f "$ROOT/assets/music.mp3" ]]; then
    MU="$ROOT/assets/music.wav"
    [[ -f "$MU" ]] || MU="$ROOT/assets/music.mp3"
    ffmpeg -y -i "$VIDEO_ONLY" -i "$VO" -i "$MU" \
      -filter_complex "[1:a]volume=1.0[vo];[2:a]volume=0.18[mu];[vo][mu]amix=inputs=2:duration=first:dropout_transition=2[a]" \
      -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$FINAL"
  else
    ffmpeg -y -i "$VIDEO_ONLY" -i "$VO" \
      -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$FINAL"
  fi
else
  cp "$VIDEO_ONLY" "$FINAL"
  echo "Note: no assets/voiceover.(wav|mp3) - wrote video-only as $FINAL"
fi

echo "Done: $FINAL"
ls -lh "$FINAL"
