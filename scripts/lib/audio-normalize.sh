# Shared helpers for the audio generators (sourced, not run).
# Requires ffmpeg with libmp3lame, plus awk.

SAMPLE_RATE=44100

need_ffmpeg() {
  command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg is required" >&2; exit 1; }
}

# Integrated loudness (LUFS) of a file, from the ebur128 summary.
lufs() {
  ffmpeg -hide_banner -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 |
    awk '/^ +I:/ { v = $2 } END { print v }'
}

# volumedetect line for the report: "mean=-14.2 max=-1.9" (dB, sample peak)
levels() {
  ffmpeg -hide_banner -nostats -i "$1" -af volumedetect -f null - 2>&1 |
    awk '/mean_volume/ { m = $5 } /max_volume/ { x = $5 } END { printf "mean=%s max=%s", m, x }'
}

# normalize_to IN.wav OUT.mp3 TARGET_LUFS PEAK_LIMIT_LINEAR BITRATE [PRE_FILTER]
# Brings IN to TARGET_LUFS with a gain, holds the peak under PEAK_LIMIT_LINEAR with a
# look-ahead limiter, and refines the gain (up to 4 rounds) so the limiter's loss is made up.
# PRE_FILTER (optional) runs before the gain, e.g. a fade.
normalize_to() {
  local in="$1" out="$2" target="$3" limit="$4" bitrate="$5" pre="${6:-anull}"
  local tmp gain i measured err
  tmp="$(mktemp -t audio-norm).wav"
  measured="$(lufs "$in")"
  gain="$(awk -v t="$target" -v m="$measured" 'BEGIN { printf "%.2f", t - m }')"
  for i in 1 2 3 4; do
    ffmpeg -hide_banner -loglevel error -y -i "$in" \
      -af "${pre},volume=${gain}dB,alimiter=limit=${limit}:attack=3:release=40:level=0" \
      -ar "$SAMPLE_RATE" -ac 1 "$tmp"
    measured="$(lufs "$tmp")"
    err="$(awk -v t="$target" -v m="$measured" 'BEGIN { printf "%.2f", t - m }')"
    awk -v e="$err" 'BEGIN { exit !((e < 0 ? -e : e) < 0.25) }' && break
    gain="$(awk -v g="$gain" -v e="$err" 'BEGIN { printf "%.2f", g + e }')"
  done
  ffmpeg -hide_banner -loglevel error -y -i "$tmp" -c:a libmp3lame -b:a "$bitrate" -ac 1 -ar "$SAMPLE_RATE" "$out"
  rm -f "$tmp"
}

# report FILE... : size, duration, loudness and levels of the decoded mp3, one line per file.
report() {
  local f dur size
  for f in "$@"; do
    dur="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")"
    size="$(wc -c < "$f" | tr -d ' ')"
    printf '%-18s %8s B  %6.2f s  %6s LUFS  %s\n' "$(basename "$f")" "$size" "$dur" "$(lufs "$f")" "$(levels "$f")"
  done
}
