#!/usr/bin/env bash
# Synthesizes the five timer alarms in public/sounds/alarms/ (bell, chime, digital, wood, kitchen).
# Pure ffmpeg (aevalsrc additive synthesis), deterministic: running it twice gives the same files.
# Each file is 1.5-3 s, mono, ~112 kbps mp3, normalized to about -14 LUFS with the peak held under -1.9 dBFS.
#
#   scripts/generate-alarm-sounds.sh [OUT_DIR]      (default: public/sounds/alarms)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/audio-normalize.sh
source "$HERE/lib/audio-normalize.sh"
need_ffmpeg

OUT_DIR="${1:-$HERE/../public/sounds/alarms}"
mkdir -p "$OUT_DIR"
WORK="$(mktemp -d -t alarms)"
trap 'rm -rf "$WORK"' EXIT

TARGET_LUFS=-14
PEAK_LIMIT=0.8   # linear, about -1.9 dBFS; leaves room for mp3 overshoot
BITRATE=112k

# --- tiny DSL: one synth source per strike/note, mixed on a timeline --------------------------
GRAPH=""
LABELS=""
COUNT=0
POST=""   # optional filter chain run on the mix (e.g. an echo), set before render()

reset_graph() { GRAPH=""; LABELS=""; COUNT=0; POST=""; }

# src DELAY_MS GAIN DURATION_S EXPR   (EXPR is a function of t, the time since this source starts)
src() {
  COUNT=$((COUNT + 1))
  GRAPH+="aevalsrc=exprs='$4':s=${SAMPLE_RATE}:d=$3,volume=$2,adelay=$1[s${COUNT}];"
  LABELS+="[s${COUNT}]"
}

# partial FREQ AMP TAU : one decaying sine term, summed with "+" by the caller
partial() { printf '%s*sin(2*PI*%s*t)*exp(-t/%s)' "$2" "$1" "$3"; }

# render NAME TOTAL_S FADE_S : mix every src(), apply POST, pad/trim to TOTAL_S, fade in 3 ms /
# out FADE_S, normalize, encode
render() {
  local name="$1" total="$2" fade="$3" start
  start="$(awk -v t="$total" -v f="$fade" 'BEGIN { printf "%.3f", t - f }')"
  ffmpeg -hide_banner -loglevel error -y \
    -filter_complex "${GRAPH}${LABELS}amix=inputs=${COUNT}:normalize=0:duration=longest${POST:+,$POST},apad=whole_dur=${total},atrim=0:${total},afade=t=in:d=0.003,afade=t=out:st=${start}:d=${fade}[out]" \
    -map "[out]" -ar "$SAMPLE_RATE" -ac 1 "$WORK/$name.wav"
  normalize_to "$WORK/$name.wav" "$OUT_DIR/$name.mp3" "$TARGET_LUFS" "$PEAK_LIMIT" "$BITRATE"
  reset_graph
}

# --- bell: a struck bell, two strikes. Inharmonic partials (hum, prime, tierce, quint,
#     nominal ...) with the high ones dying first; a detuned twin of the prime makes it shimmer.
bell_strike="$(partial 350 0.45 2.2)+$(partial 700 1.0 1.6)+$(partial 702.2 0.5 1.5)+$(partial 840 0.6 1.2)\
+$(partial 1050 0.4 1.0)+$(partial 1400 0.7 0.9)+$(partial 1750 0.3 0.6)+$(partial 2100 0.25 0.5)+$(partial 2800 0.2 0.35)"
bell_strike="(${bell_strike})*(1-exp(-t*1500))"
reset_graph
src 0    1.0 3.0 "$bell_strike"
src 1100 0.7 1.9 "$bell_strike"
render bell 3.0 0.6

# --- chime: soft ascending C-E-G arpeggio (C6, E6, G6), each note a sine with a quiet octave
#     and a slightly detuned twin; the last note rings longer.
chime_note() { # FREQ TAU
  printf '(sin(2*PI*%s*t)+0.35*sin(2*PI*%s*t)+0.12*sin(2*PI*2*%s*t)*exp(-t/0.2))*exp(-t/%s)*(1-exp(-t*300))' \
    "$1" "$(awk -v f="$1" 'BEGIN { print f * 1.004 }')" "$1" "$2"
}
reset_graph
src 0   0.9 1.6 "$(chime_note 1046.5 0.45)"
src 230 0.9 1.6 "$(chime_note 1318.5 0.45)"
src 460 1.0 2.0 "$(chime_note 1568.0 0.85)"
render chime 2.4 0.5

# --- digital: two pairs of short, rounded beeps (E6 then G6), a little echo to soften them
beep() { # FREQ
  printf '(sin(2*PI*%s*t)+0.22*sin(2*PI*3*%s*t))*min(1,t/0.006)*min(1,(0.12-t)/0.03)' "$1" "$1"
}
reset_graph
src 0    1.0 0.12 "$(beep 1318.5)"
src 190  1.0 0.12 "$(beep 1568.0)"
src 800  1.0 0.12 "$(beep 1318.5)"
src 990  1.0 0.12 "$(beep 1568.0)"
POST="aecho=0.8:0.5:90|180:0.3|0.15"
render digital 1.6 0.2

# --- wood: wood-block knocks, two groups of three (high, low, high). Fast-decaying body
#     resonance plus a stiff upper partial; the sharp attack is the "tok".
knock() { # FREQ
  printf '(1.0*sin(2*PI*%s*t)*exp(-t/0.045)+0.55*sin(2*PI*%s*2.4*t)*exp(-t/0.02)+0.25*sin(2*PI*%s*4.1*t)*exp(-t/0.008))*(1-exp(-t*6000))' "$1" "$1" "$1"
}
reset_graph
for base in 0 1050; do
  src $((base))       1.0 0.35 "$(knock 1000)"
  src $((base + 210)) 0.9 0.35 "$(knock 780)"
  src $((base + 420)) 1.0 0.35 "$(knock 1000)"
done
render wood 1.9 0.2

# --- kitchen: a wind-up kitchen timer. A hammer flips between two small bells ~14 times a
#     second (period 0.07 s), each hit a short inharmonic ping; two bursts of ringing.
ring='(if(lt(mod(t,0.14),0.07),sin(2*PI*1760*t)+0.2*sin(2*PI*1760*2.76*t)*exp(-mod(t,0.07)/0.006),sin(2*PI*2217*t)+0.2*sin(2*PI*2217*2.76*t)*exp(-mod(t,0.07)/0.006)))*exp(-mod(t,0.07)/0.028)*(1-exp(-mod(t,0.07)/0.0008))*min(1,t/0.02)*min(1,(0.85-t)/0.03)'
reset_graph
src 0    1.0 0.85 "$ring"
src 1000 1.0 0.85 "$ring"
POST="lowpass=f=6500"
render kitchen 1.95 0.15

echo "Wrote $OUT_DIR:"
report "$OUT_DIR"/{bell,chime,digital,wood,kitchen}.mp3
