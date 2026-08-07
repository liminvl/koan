#!/usr/bin/env bash
# rtk-probe — Tier-1/2 harness for the RTK ↔ koan wrap-vs-truncation caveat.
#
# Answers, offline and read-only, the one empirical question behind the caveat:
# does `rtk git log` / `rtk git status` DROP anything koan-wrap needs?
# (koan-wrap step 1 runs exactly `git log --oneline <LH>..HEAD` + `git status --short`.)
#
#   Tier 1 (fidelity): are all raw commit hashes / changed paths still traceable
#                      in rtk's compacted output? Dropped signal ⇒ caveat is real.
#   Tier 2 (savings):  chars / lines / ~tokens raw vs rtk — the orthogonality
#                      claim measured on YOUR repo, not RTK's marketing table.
#
# Touches nothing but stdout. No hook, no settings, no API spend, no koan invoked.
#
# Usage:
#   ./rtk-probe.sh [repo-path] [last-handoff-commit] [handoff-doc]
#     repo-path            default: .                (must be a git repo)
#     last-handoff-commit  default: auto (newest commit touching the handoff doc
#                          that isn't HEAD; falls back to HEAD~20)
#     handoff-doc          default: docs/HANDOFF.md
#
# Examples:
#   ./rtk-probe.sh .                      # probe koan itself
#   ./rtk-probe.sh ../vibe-shield         # a field repo
#   ./rtk-probe.sh . HEAD~30              # force a wider, more meaningful range

set -uo pipefail

REPO="${1:-.}"
LH_ARG="${2:-}"
DOC="${3:-docs/HANDOFF.md}"

die() { printf '\033[31m%s\033[0m\n' "$*" >&2; exit 1; }
hdr() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }

command -v rtk >/dev/null 2>&1 || die \
"rtk not on PATH. Install first:
  - release .exe (Windows): rtk-x86_64-pc-windows-msvc.zip -> PATH, or
  - cargo install --git https://github.com/rtk-ai/rtk
This probe compares raw git vs rtk, so rtk must be present."

git -C "$REPO" rev-parse --git-dir >/dev/null 2>&1 || die "not a git repo: $REPO"
cd "$REPO" || die "cannot cd: $REPO"          # run both git and rtk on cwd = repo,
REPO_ABS=$(pwd)                                # which is how rtk actually operates
G() { git "$@"; }                              # raw git, always un-rewritten
R() { rtk git "$@" 2>/dev/null; }              # rtk's compacted equivalent (cwd)

# --- resolve the range -------------------------------------------------------
HEAD_SHA=$(G rev-parse --short HEAD)
if [ -n "$LH_ARG" ]; then
  LH="$LH_ARG"
else
  # newest commit touching the doc that is NOT HEAD; else a sane default window
  LH=$(G log --format=%H -- "$DOC" 2>/dev/null \
       | while read -r c; do [ "$(G rev-parse --short "$c")" != "$HEAD_SHA" ] && echo "$c" && break; done)
  [ -z "$LH" ] && { LH=$(G rev-parse HEAD~20 2>/dev/null); WIDE_FALLBACK=1; }
fi
G rev-parse --verify "$LH" >/dev/null 2>&1 || die "bad last-handoff ref: $LH"
LH_SHORT=$(G rev-parse --short "$LH")
N=$(G rev-list --count "$LH..HEAD")

printf '\033[1mrtk-probe\033[0m  repo=%s  range=%s..%s  (%s commits)\n' \
  "$REPO_ABS" "$LH_SHORT" "$HEAD_SHA" "$N"
[ "${WIDE_FALLBACK:-0}" = 1 ] && \
  printf '  (no prior handoff commit found in %s -- fell back to HEAD~20)\n' "$DOC"
[ "$N" -lt 5 ] && \
  printf '\033[33m  note: only %s commits in range -- pass a wider ref (e.g. HEAD~30) for a meatier test\033[0m\n' "$N"

# --- helpers -----------------------------------------------------------------
report_savings() { # raw_file rtk_file label
  local raw="$1" rtk="$2" lbl="$3" rc lc xc xl pct
  rc=$(wc -c <"$raw"); lc=$(wc -l <"$raw")
  xc=$(wc -c <"$rtk"); xl=$(wc -l <"$rtk")
  if [ "$rc" -gt 0 ]; then pct=$(( (rc-xc)*100/rc )); else pct=0; fi
  printf '  %-12s raw: %6s chars / %4s lines / ~%s tok\n' "$lbl" "$rc" "$lc" "$((rc/4))"
  printf '  %-12s rtk: %6s chars / %4s lines / ~%s tok   \033[36m(-%s%%)\033[0m\n' "" "$xc" "$xl" "$((xc/4))" "$pct"
}

# fidelity: how many needles (one per line in $1) appear as substrings in haystack $2.
# Single awk process — avoids a grep-per-item fork storm (Git Bash "Aborted").
# Prints:  "<found> <total>" then "MISS <needle>" lines.
fidelity() { # needles_file haystack_file
  awk '
    NR==FNR { if($0!=""){ need[$0]=1; tot++ } ; next }
            { for(k in need) if(!seen[k] && index($0,k)) seen[k]=1 }
    END     { f=0; for(k in need) if(seen[k]) f++; print f, tot;
              for(k in need) if(!seen[k]) print "MISS", k }
  ' "$1" "$2"
}

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# ============================================================================
# CHANNEL 1: git log --oneline <LH>..HEAD   (wrap's "what actually shipped")
# ============================================================================
hdr "git log --oneline ${LH_SHORT}..HEAD"
G log --oneline "$LH..HEAD" > "$TMP/log.raw"
R log --oneline "$LH..HEAD" > "$TMP/log.rtk"
G log --format=%h "$LH..HEAD" > "$TMP/hashes"    # authoritative short-hash set

read -r FOUND TOT < <(fidelity "$TMP/hashes" "$TMP/log.rtk")
MISS=$(fidelity "$TMP/hashes" "$TMP/log.rtk" | awk '/^MISS/{printf " %s",$2}')
printf '  \033[1mfidelity:\033[0m %s/%s commit hashes traceable in rtk output\n' "$FOUND" "$TOT"
if [ -n "$MISS" ]; then
  printf '  \033[31m  DROPPED:%s\033[0m  <- caveat is REAL on this repo\n' "$MISS"
elif [ "$TOT" -gt 0 ]; then
  printf '  \033[32m  all commits survive rtk compaction -- faithful for wrap\033[0m\n'
fi
report_savings "$TMP/log.raw" "$TMP/log.rtk" "git log"

# ============================================================================
# CHANNEL 2: git status --short   (wrap's "uncommitted work")
# ============================================================================
hdr "git status --short"
G status --short > "$TMP/st.raw"
R status --short > "$TMP/st.rtk"
if [ ! -s "$TMP/st.raw" ]; then
  printf '  working tree clean -- nothing to compare (run with a dirty tree for this channel)\n'
  PMISS=""
else
  awk '{print $NF}' "$TMP/st.raw" | sort -u > "$TMP/paths"   # changed path (rename -> new)
  read -r PFOUND PTOT < <(fidelity "$TMP/paths" "$TMP/st.rtk")
  PMISS=$(fidelity "$TMP/paths" "$TMP/st.rtk" | awk '/^MISS/{printf " %s",$2}')
  printf '  \033[1mfidelity:\033[0m %s/%s changed paths traceable in rtk output\n' "$PFOUND" "$PTOT"
  [ -n "$PMISS" ] && printf '  \033[31m  DROPPED:%s\033[0m  <- wrap may miss uncommitted work\n' "$PMISS"
  report_savings "$TMP/st.raw" "$TMP/st.rtk" "git status"
fi

# --- verdict -----------------------------------------------------------------
hdr "verdict"
if [ -n "$MISS" ] || [ -n "$PMISS" ]; then
  printf '  \033[31mrtk drops signal koan-wrap reads.\033[0m Mitigate: let wrap run raw git\n'
  printf '  (e.g. `command git log ...`), or narrow which commands rtk rewrites.\n'
else
  printf '  \033[32mrtk preserved every commit + path wrap needs on this repo.\033[0m\n'
  printf '  Caveat is theoretical here -- safe to document rtk as "faithful for wrap".\n'
fi
printf '\n  (Tier 3 -- an actual /koan-wrap with the hook on vs off -- only earns its\n'
printf '   cost if the fidelity lines above show DROPPED. This probe is the gate.)\n'
