#!/usr/bin/env bash
# Generates the three noise ambients in public/sounds/noise/ (white, pink, brown).
# Each is 60 s, mono, 96 kbps mp3, about -20 LUFS, and loops without a click: noise is made
# 2 s longer than the loop, and the head of the loop is crossfaded (equal power) with the
# extra tail, so the last sample flows straight into the first one.
# Deterministic: anoisesrc is seeded, running it twice gives the same files.
#
#   scripts/generate-noise-sounds.sh [OUT_DIR]      (default: public/sounds/noise)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/audio-normalize.sh
source "$HERE/lib/audio-normalize.sh"
need_ffmpeg

OUT_DIR="${1:-$HERE/../public/sounds/noise}"
mkdir -p "$OUT_DIR"
WORK="$(mktemp -d -t noise)"
trap 'rm -rf "$WORK"' EXIT

LOOP_S=60
XFADE_S=2
TARGET_LUFS=-20
PEAK_LIMIT=0.9
BITRATE=96k

# make_noise NAME COLOR SEED FILTERS
#   FILTERS shape the raw noise before the loop is cut ("anull" for none).
make_noise() {
  local name="$1" color="$2" seed="$3" filters="$4" total=$((LOOP_S + XFADE_S))
  ffmpeg -hide_banner -loglevel error -y \
    -filter_complex "anoisesrc=color=${color}:amplitude=0.5:sample_rate=${SAMPLE_RATE}:duration=${total}:seed=${seed},${filters},asplit[a][b];\
[a]atrim=${LOOP_S}:${total},asetpts=PTS-STARTPTS[tail];\
[b]atrim=0:${LOOP_S},asetpts=PTS-STARTPTS[body];\
[tail][body]acrossfade=d=${XFADE_S}:c1=qsin:c2=qsin[out]" \
    -map "[out]" -ar "$SAMPLE_RATE" -ac 1 "$WORK/$name.wav"
  normalize_to "$WORK/$name.wav" "$OUT_DIR/$name.mp3" "$TARGET_LUFS" "$PEAK_LIMIT" "$BITRATE"
}

# White: a gentle one-pole low-pass at 7 kHz takes the hiss off the top so it is not harsh.
make_noise white-noise white 11 "lowpass=f=7000:poles=1"
# Pink: as generated (equal energy per octave).
make_noise pink-noise pink 23 "anull"
# Brown: drop the sub-bass below 25 Hz (rumble that only eats headroom and small speakers).
make_noise brown-noise brown 37 "highpass=f=25:poles=2"

echo "Wrote $OUT_DIR:"
report "$OUT_DIR"/{white-noise,pink-noise,brown-noise}.mp3
