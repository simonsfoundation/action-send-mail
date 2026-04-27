# Publishing & Releasing

## Versioning Strategy

Uses semantic versioning with two tag types:

- **Exact tags** (`v1.2.3`) — immutable, pinned releases
- **Floating major tags** (`v1`) — always points to the latest `v1.x.x` release

Callers who use `simonsfoundation/action-send-mail@v1` get updates automatically within a major version. Callers who pin to `v1.2.3` get no automatic updates.

Increment version per semver rules:
- **patch** (`v1.0.1`) — bug fixes, no input/output changes
- **minor** (`v1.1.0`) — new optional inputs, backwards-compatible
- **major** (`v2.0.0`) — removed/renamed inputs, changed behavior, breaking changes

---

## Pre-Release Checklist

```bash
# 1. Tests pass
npm test

# 2. Rebuild dist with latest source
npm run build

# 3. Stage and commit dist + any source changes
git add src/ dist/ scripts/ action.yml package.json package-lock.json
git commit -m "chore: release vX.Y.Z"

# 4. Push to main
git push origin main
```

`dist/` **must be committed** — GitHub Actions runs it directly from the repo.

---

## Creating a Release

### 1. Create the exact version tag

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 2. Move the floating major tag

```bash
# Delete old local + remote major tag
git tag -d v1
git push origin :refs/tags/v1

# Re-create pointing at the new release
git tag -a v1 -m "Update v1 to v1.0.0"
git push origin v1
```

### 3. Create a GitHub Release

```bash
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes "$(cat <<'EOF'
## What's changed
- Added tests using local smtp

## Breaking changes
None.

## Full changelog
https://github.com/YOUR_ORG/action-send-mail/compare/v1.0.0-prev...v1.0.0
EOF
)"
```

Or via the GitHub UI: **Releases → Draft a new release → choose tag `v1.0.0`**.

---

## Publishing to GitHub Marketplace

### First-time publish

The repo must be **public**.

1. Go to the repo on GitHub
2. Click **Releases → Draft a new release**
3. Select or create tag `v1.0.0`
4. Check **"Publish this Action to the GitHub Marketplace"** (appears automatically when `action.yml` is valid at root)
5. Fill in release notes
6. Click **Publish release**

GitHub validates `action.yml` — it must have `name`, `description`, `runs`, and `branding`.

### Updating the Marketplace listing for a new release

The Marketplace listing updates automatically when a new GitHub Release is published against a new tag. No separate Marketplace UI step needed.

1. Complete the [Pre-Release Checklist](#pre-release-checklist)
2. Create the exact tag and push it (step 1 above)
3. Move the floating major tag (step 2 above)
4. Publish a GitHub Release against the new exact tag — the Marketplace listing reflects the latest release immediately

### Editing the Marketplace listing metadata

To change the action **name**, **description**, **icon**, or **category**:

- `name` / `description` / `branding` — edit `action.yml`, commit, release
- **Category** — set once via the Marketplace listing page at:
  `https://github.com/marketplace/actions/YOUR-ACTION-SLUG/edit`

---

## Automating Releases (optional)

Workflow `.github/workflows/release.yml` added to automate tagging and Marketplace publishing on push to `main`:



Trigger a release by tagging locally and pushing:

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

The workflow builds, tests, and publishes the release. Then manually move the floating `v1` tag.

---

## Caller Reference

After publishing, callers use the action as:

```yaml
# Pinned to exact version (recommended for production)
uses: YOUR_ORG/action-send-mail@v1.0.0

# Floating major tag (gets patch/minor updates automatically)
uses: YOUR_ORG/action-send-mail@v1
```
