#!/bin/bash
# Usage: ./scripts/build-pages.sh pages-queue.txt
#
# Builds each queued page directly on the current branch (main) — no per-page
# worktree, branch, or PR. Runs one route at a time in this checkout.

set -e
QUEUE_FILE="${1:-pages-queue.txt}"

while IFS= read -r route; do
  [ -z "$route" ] && continue
  echo "=== Building: $route ==="

  claude -p "Read CLAUDE.md first. Using specs/_template-crawl-and-build.md as the
pattern, first crawl https://uat-iam.providhy.com/${route} via Claude in Chrome to
discover real fields per Step 0, then build the '${route}' page in this codebase's
design system with mock data matching those fields. Pick the closest existing sibling
page in this codebase as the structural/styling reference. Run all verification steps
before finishing. Commit your work directly to the current branch (main). Do NOT
create a new branch, do NOT push, and do NOT open a pull request." \
    --allowedTools "Edit,Bash(npm run *),Bash(git add *),Bash(git commit *)" \
    --max-turns 60 \
    --output-format json > "logs/${route//\//_}.json"

  echo "=== Done: $route ==="
done < "$QUEUE_FILE"
