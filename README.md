# action-send-mail

GitHub Action to send email via SMTP — plain text, HTML, or with attachments.

## Usage

```yaml
      - name: Failure notification
        if: failure()
        uses: simonsfoundation/action-send-mail@v1
        with:
          server_address: ${{ secrets.SMTP_SERVER }}
          server_port: 587
          username: ${{ secrets.SMTP_USERNAME }}
          password: ${{ secrets.SMTP_PASSWORD }}
          subject: "[GitHubAction] Failed ${{ github.workflow }} #${{ github.run_number }}"
          to: ${{ vars.EMAIL_RECIPIENT }}
          from: Github Actions <gh-action@simonsfoundation.org>
          body: |
            Hello!

            Workflow "${{ github.workflow }}" has encountered a failure in the GitHub Action.

            Please review the log at ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}

            Contact developer if you need assistance.

```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `server_address` | yes | — | SMTP server hostname |
| `server_port` | no | `587` | SMTP server port |
| `secure` | no | `false` | `true` = direct TLS (port 465); `false` = STARTTLS |
| `username` | no | — | SMTP auth username |
| `password` | no | — | SMTP auth password |
| `subject` | yes | — | Email subject |
| `to` | yes | — | Recipient(s), comma-separated |
| `from` | yes | — | FROM address, e.g. `Display Name <user@example.com>` |
| `envelope_from` | no | — | Envelope FROM for bounces/SPF. Defaults to `from`. |
| `reply_to` | no | — | Reply-To address |
| `cc` | no | — | CC recipients, comma-separated |
| `bcc` | no | — | BCC recipients, comma-separated |
| `body` | no | — | Plain text body |
| `html_body` | no | — | HTML body. If both set, sends multipart message. |
| `attachments` | no | — | File paths to attach, comma-separated. Supports globs. |
| `ignore_cert` | no | `false` | Ignore TLS certificate errors (not recommended) |
| `priority` | no | `normal` | Email priority: `high`, `normal`, or `low` |

At least one of `body` or `html_body` must be provided.

## Outputs

| Output | Description |
|--------|-------------|
| `result` | Response message from the SMTP server |

## Examples

### Plain text to multiple recipients

```yaml
- uses: simonsfoundation/action-send-mail@v1
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.GMAIL_USER }}
    password: ${{ secrets.GMAIL_APP_PASSWORD }}
    subject: Deployment complete
    to: alice@example.com, bob@example.com
    from: ${{ secrets.GMAIL_USER }}
    body: |
      Deployment of ${{ github.repository }} finished.
      Commit: ${{ github.sha }}
```

### HTML email

```yaml
- uses: simonsfoundation/action-send-mail@v1
  with:
    server_address: smtp.example.com
    server_port: 465
    secure: true
    username: ${{ secrets.SMTP_USER }}
    password: ${{ secrets.SMTP_PASS }}
    subject: Report ready
    to: reports@example.com
    from: noreply@example.com
    html_body: |
      <h1>Report</h1>
      <p>Run <strong>#${{ github.run_number }}</strong> completed.</p>
```

### Email with attachment

```yaml
- name: Build report
  run: make report.pdf

- uses: simonsfoundation/action-send-mail@v1
  with:
    server_address: smtp.example.com
    server_port: 587
    username: ${{ secrets.SMTP_USER }}
    password: ${{ secrets.SMTP_PASS }}
    subject: Weekly report
    to: manager@example.com
    from: ci@example.com
    body: See attached report.
    attachments: report.pdf
```

### Custom envelope FROM (SPF/bounce handling)

```yaml
- uses: simonsfoundation/action-send-mail@v1
  with:
    server_address: smtp.example.com
    server_port: 587
    username: ${{ secrets.SMTP_USER }}
    password: ${{ secrets.SMTP_PASS }}
    subject: Notification
    to: user@example.com
    from: Notifications <notifications@example.com>
    envelope_from: bounces@example.com
    body: This is a notification.
```

## Development

```bash
npm install
npm run build   # produces dist/index.js
```

Commit `dist/` — GitHub Actions runs the bundled file directly.

## License

MIT — Simons Foundation
