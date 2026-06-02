---
name: oauth-admin-upgrade
description: When GitHub OAuth is implemented, switch admin auth from password to GitHub ID
metadata:
  type: project
---

# GitHub OAuth Admin Upgrade

When GitHub OAuth is implemented (Phase 4), switch admin authentication:

## Current approach (temporary)
- Admin created via seed migration with email/password
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars

## Target approach (after OAuth)
- Remove `ADMIN_PASSWORD` entirely
- Add `ADMIN_GITHUB_ID` env var (your GitHub numeric ID)
- In GitHub OAuth callback: if `github_id == ADMIN_GITHUB_ID` → grant admin role
- Benefits: no password to leak, GitHub 2FA protects your account, no brute-force risk

**Why:** Password-based admin has inherent risks (default passwords, brute force, hash storage). GitHub OAuth delegates auth to GitHub's infrastructure including 2FA.
