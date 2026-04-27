# CLAUDE.md

## What this repo is

GitHub Action that sends email via SMTP. Used in GitHub Actions workflows across other Simons Foundation repositories.

Published as `simonsfoundation/action-send-mail` on GitHub Marketplace.

Supports: plain text, HTML, multipart, multiple recipients (to/cc/bcc), file attachments with glob patterns, custom FROM display name, separate envelope FROM for SPF/bounce routing, STARTTLS and direct TLS.

---

## Repo structure

```
action.yml          # Action metadata — inputs, outputs, runtime (node24)
src/index.js        # All action logic — read inputs, resolve attachments, send via nodemailer
dist/index.js       # Bundled output — what GitHub Actions actually runs (must be committed)
scripts/
  smtp-test-server.js   # Fake SMTP server for local integration testing
  test-local.sh         # Smoke test script using INPUT_* env vars
src/__tests__/
  index.test.js     # 14 Jest unit tests (mocked, no network)
```

---

## Making code changes

### 1. Edit source

All logic lives in `src/index.js`. Do not edit `dist/` directly.

### 2. Run tests

```bash
npm test
```

### 3. Rebuild dist

```bash
npm run build
```

`dist/index.js` must be rebuilt and committed after every source change — it is what GitHub Actions executes.

### 4. Commit both src and dist

```bash
git add src/ dist/ action.yml package.json package-lock.json
git commit -m "..."
```

### Adding a new input

1. Add entry to `inputs:` in `action.yml`
2. Read it in `src/index.js` via `core.getInput('input_name')`
3. Add a test case in `src/__tests__/index.test.js`
4. Document in `README.md` inputs table
5. Rebuild dist (`npm run build`)

---

## Key dependencies

| Package | Purpose |
|---------|---------|
| `nodemailer` | SMTP transport |
| `@actions/core` | Read inputs, set outputs, log, fail the action |
| `glob` | Resolve attachment file patterns |
| `@vercel/ncc` | Bundle `src/index.js` → single `dist/index.js` |

---

## Testing

See **[TESTING.md](TESTING.md)** for full instructions:
- Unit tests: `npm test`
- Local end-to-end: fake SMTP server + smoke test script

---

## Publishing & Marketplace

See **[PUBLISHING.md](PUBLISHING.md)** for full instructions covering:
- Pre-release checklist
- Creating exact version tags (`v1.0.0`) and floating major tags (`v1`)
- Publishing/updating the GitHub Marketplace listing
- Optional automated release workflow
