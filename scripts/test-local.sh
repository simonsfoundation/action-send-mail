#!/usr/bin/env bash
# Local smoke test — run dist/index.js against the fake SMTP server.
# Prerequisites:
#   1. Build: npm run build
#   2. Start fake SMTP in another terminal: node scripts/smtp-test-server.js

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

export INPUT_SERVER_ADDRESS=127.0.0.1
export INPUT_SERVER_PORT=1025
export INPUT_SECURE=false
export INPUT_USERNAME=""
export INPUT_PASSWORD=""
export INPUT_SUBJECT="Local test — $(date '+%Y-%m-%d %H:%M:%S')"
export INPUT_TO="recipient@example.com"
export INPUT_FROM="CI Bot <ci@example.com>"
export INPUT_ENVELOPE_FROM=""
export INPUT_REPLY_TO=""
export INPUT_CC=""
export INPUT_BCC=""
export INPUT_BODY="Hello from local smoke test.
Repo: ${REPO_ROOT}"
export INPUT_HTML_BODY=""
export INPUT_ATTACHMENTS=""
export INPUT_IGNORE_CERT=false
export INPUT_PRIORITY=normal

echo "Sending test email via 127.0.0.1:1025 ..."
node "${REPO_ROOT}/dist/index.js"
echo "Done. Check the smtp-test-server terminal for the received email."
