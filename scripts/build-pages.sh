#!/bin/bash
# Usage: ./scripts/build-pages.sh pages-to-build.md

set -e
QUEUE_FILE="${1:-pages-to-build.md}"

# Extract route names from the queue (adjust parsing once we see the real file)
routes=$(grep -oP '(?<=\| )[a-zA-Z0-9/_-]+(?= \|)' "$QUEUE_FILE" | sort -u)

for route in $routes; do
  echo "=== Building: $route ==="
  branch="page/$route"
  git worktree add "../worktrees/$route" -b "$branch" 2>/dev/null || true

  (
    cd "../worktrees/$route"
    claude -p "Build the page at route '$route' following templates/page-spec.md for this route (fill in spec details from pages-to-build.md and /design-refs/${route}.png if not already written). Follow CLAUDE.md rules strictly — reuse existing components, no hardcoded values. Run the verification steps in the spec. If verification passes, commit and push, then open a PR against main." \
      --allowedTools "Edit,Bash(npm run *),Bash(git add *),Bash(git commit *),Bash(git push *),Bash(gh pr create *)" \
      --max-turns 40 \
      --output-format json > "../../logs/${route//\//_}.json"
  )

  echo "=== Done: $route (see logs/${route//\//_}.json) ==="
done