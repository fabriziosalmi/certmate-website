#!/usr/bin/env bash
# Turn a drift check's result into an issue, because a red scheduled run is
# read by nobody.
#
# check-against-app.mjs reported "VERSION is 2.32.2; the latest published
# release is 2.33.0" on 21 September and "2.37.0 ... 2.39.0" on 28 September,
# correctly, and failed its run each time. Nothing else happened: the site went
# on announcing 2.37.0 through eleven releases, because a failed scheduled
# workflow notifies nobody who is looking. An issue in this repository does.
#
#   report-drift.sh "<issue title>" <output file> <marker> <outcome>
#
# <marker> is the line a check prints once it has actually compared something.
# Without it the check did not run (GitHub unreachable, a script error), which
# is not drift: the run stays red and no issue is opened for it.
#
# One open issue per title. Drift found: open it, or comment on it when the
# findings changed (the same findings again add nothing, so a standing drift
# does not post every day). No drift: close it.
set -euo pipefail

title="$1"
output_file="$2"
marker="$3"
outcome="$4"
run_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

existing=$(TITLE="$title" gh issue list --repo "$GITHUB_REPOSITORY" --state open --limit 200 \
  --json number,title --jq '.[] | select(.title == env.TITLE) | .number' | head -n 1)

if ! grep -qF "$marker" "$output_file"; then
  echo "the check did not reach a comparison; not reporting it as drift"
  exit 0
fi

if [ "$outcome" = "success" ]; then
  if [ -n "$existing" ]; then
    gh issue close "$existing" --repo "$GITHUB_REPOSITORY" --comment "No drift found by ${run_url}."
  fi
  exit 0
fi

findings=$(grep -vF "$marker" "$output_file" | sed '/^[[:space:]]*$/d')
body=$(printf 'Found by the scheduled check: %s\n\n```\n%s\n```\n\nThis issue closes itself when the check finds no drift.\n' "$run_url" "$findings")

if [ -z "$existing" ]; then
  gh issue create --repo "$GITHUB_REPOSITORY" --title "$title" --body "$body"
  exit 0
fi

previous=$(gh issue view "$existing" --repo "$GITHUB_REPOSITORY" --json body --jq .body \
  | awk '/^```$/ { inside = !inside; next } inside')
if [ "$previous" = "$findings" ]; then
  echo "issue #${existing} already says this"
  exit 0
fi
gh issue edit "$existing" --repo "$GITHUB_REPOSITORY" --body "$body"
gh issue comment "$existing" --repo "$GITHUB_REPOSITORY" --body "The findings changed: ${run_url}

\`\`\`
${findings}
\`\`\`"
