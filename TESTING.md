# Testing

## Unit Tests

Mock-based tests — no network, no SMTP server required.

```bash
npm test
```

14 tests covering: plain text, HTML, multipart, multiple recipients, CC/BCC, envelope FROM, attachments (including glob patterns and missing files), auth, TLS cert ignore, SMTP errors, and output.

---

## Local Smoke Test (end-to-end)

Runs the bundled `dist/index.js` against a local fake SMTP server.

### Step 1 — Build

```bash
npm run build
```

### Step 2 — Start fake SMTP server

In one terminal:

```bash
node scripts/smtp-test-server.js
```

Listens on `127.0.0.1:1025`. Prints received emails to stdout. No Docker required.

### Step 3 — Send test email

In a second terminal:

```bash
bash scripts/test-local.sh
```

Check the first terminal — the full raw email (headers + body) will be printed.

### Customizing the smoke test

Edit `scripts/test-local.sh` to change inputs. All GitHub Actions inputs map to `INPUT_<NAME>` env vars (uppercase). For example:

```bash
export INPUT_TO="you@example.com"
export INPUT_SUBJECT="My custom subject"
export INPUT_HTML_BODY="<h1>Hello</h1>"
export INPUT_ATTACHMENTS="/path/to/file.pdf"
```

---

## Testing Against a Real SMTP Server

Set credentials in `scripts/test-local.sh` before running:

```bash
export INPUT_SERVER_ADDRESS=smtp.gmail.com
export INPUT_SERVER_PORT=587
export INPUT_SECURE=false
export INPUT_USERNAME=you@gmail.com
export INPUT_PASSWORD=your-app-password
export INPUT_TO=recipient@example.com
export INPUT_FROM=you@gmail.com
```

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your account password.
