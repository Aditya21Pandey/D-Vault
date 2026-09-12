# DevOps, Security, and QA Artifacts

This directory serves as the centralized repository for all DevOps, Security, and Quality Assurance (QA) artifacts across the project.

## Overview & Project References

- **CI/CD Workflows**: Central automation pipelines are located at [`.github/workflows/`](../.github/workflows/).
- **Containerization & Local Setup**: Docker and container configs reside at the repository root in [`docker-compose.yml`](../docker-compose.yml).
- **Security & QA Hub**: This `security/` directory specifically stores security checklists, audit reports, penetration-testing notes, and QA scripts that do not belong directly inside [`backend/`](../backend/) or [`frontend-web3/`](../frontend-web3/).

---

## Directory Structure

- `checklists/` — Pre-deployment verification lists, audit checklists, and hardening steps.
- `reports/` — Vulnerability assessments, automated scanner outputs, and penetration testing findings.
- `scripts/` — QA automation routines, testing utilities, and standalone security audit helper scripts.
- `docs/` — Threat modeling diagrams, security architecture specifications, and policies.

---

## Smart Contract Security

Security reviews, static analysis routines, and verification protocols for Ethereum smart contracts (`contracts/`):
- 📋 [Smart Contract Security Checklist](checklists/smart-contract-security-checklist.md) — Pre-audit checks covering ReentrancyGuard, RBAC `ROLE_BYTES32` alignment, integer safety, and MEV front-running vectors.
- ⚙️ [Contracts CI Workflow](../.github/workflows/contracts-ci.yml) — Pre-built pipeline compiling Hardhat tests and running Slither static analysis on push/PR to `contracts/**`.

---

## Backend Security & Threat Modeling

Comprehensive analysis of the off-chain API gateway attack surfaces, trust boundaries, and mitigation strategies is documented in:
- 📖 [Threat Model & Attack Surface Analysis](docs/threat-model.md)
- 🛡️ [Root Security Policy](../SECURITY.md)

Key attack surfaces covered:
- **JWT Handling**: Token expiry enforcement, secret entropy requirements (`min(16)` via Zod), and algorithm confusion protections.
- **Nonce Replay Prevention**: Single-use UUID challenges with `NONCE_TTL_SECONDS` limits.
- **RBAC Server Enforcement**: Strict 403 authorization middleware independent of frontend UI state (`PermissionGate`).
- **File & IPFS Protections**: 10MB memory-capped multer upload with MIME-type filtering.
- **Rate Limiting**: Multi-tier `express-rate-limit` guards across public and authentication endpoints.

---

## Dependency Audits

Third-party vulnerability management is governed through automated CI audits, scheduled Dependabot scans, and pre-demo inspection procedures:

- **Automated Workflow**: [`.github/workflows/dependency-audit.yml`](../.github/workflows/dependency-audit.yml) runs weekly and on PRs modifying `package.json`/`package-lock.json`, outputting high/critical findings to the GitHub Actions Job Summary without blocking rapid prototyping.
- **Automated PR Bumps**: [`.github/dependabot.yml`](../.github/dependabot.yml) inspects `backend/` and `frontend-web3/` weekly, with GitHub Actions workflows audited monthly.
- **Pre-Demo Protocol**: Review [`security/checklists/dependency-audit-checklist.md`](checklists/dependency-audit-checklist.md) for the mandatory 24-hour pre-presentation audit and triage procedure.

---

## CI/CD Pipeline Status

| Pipeline | Target | Triggers | Status |
| :--- | :--- | :--- | :--- |
| **Backend CI** | `backend/**` | Push/PR (`main`, `develop`) | [![Backend CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/backend-ci.yml) |
| **Frontend CI** | `frontend-web3/**` | Push/PR (`main`, `develop`) | [![Frontend CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/frontend-ci.yml) |
| **Contracts CI** | `contracts/**` | Push/PR (`main`, `develop`) | [![Contracts CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/contracts-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/contracts-ci.yml) |
| **Frontend Preview** | `frontend-web3/**` | PR (`main`, `develop`) | [`.github/workflows/deploy-frontend-preview.yml`](../.github/workflows/deploy-frontend-preview.yml) |

- **Backend CI Workflow**: [`.github/workflows/backend-ci.yml`](../.github/workflows/backend-ci.yml)
  1. Node 20 environment with scoped `package-lock.json` caching
  2. Strict dependency installation (`npm ci`)
  3. Linter validation (`npm run lint`)
  4. Prisma Client generation (`npx prisma generate`)
  5. Isolated unit and integration test suite execution (`npm test`)
  6. TypeScript compile verification (`npm run build`)
- **Frontend CI Workflow**: [`.github/workflows/frontend-ci.yml`](../.github/workflows/frontend-ci.yml)
  1. Node 20 environment with scoped `package-lock.json` caching
  2. Peer-dependency resilient install (`npm ci --legacy-peer-deps`)
  3. Next.js ESLint validation (`npm run lint`)
  4. Next.js production build (`npm run build` with `NEXT_PUBLIC_USE_MOCK_DATA=true`)
- **Frontend Preview Workflow (Vercel)**: [`.github/workflows/deploy-frontend-preview.yml`](../.github/workflows/deploy-frontend-preview.yml)
  1. Deploys non-blocking Next.js previews on PRs in mock data mode
  2. Injects preview URL directly as a comment on the active PR
- **Backend Deployment Protocol (Render)**: [`security/checklists/backend-deployment-checklist.md`](checklists/backend-deployment-checklist.md)
  1. Manual deployment protocol for managed PostgreSQL and Express Web Service on Render
  2. Migrates schemas (`prisma migrate deploy`) and binds health check at `/health`

---

## Secret Scanning

We use **[Gitleaks](https://github.com/gitleaks/gitleaks)** to prevent accidental commits of private keys, JWT secrets, database connection strings, and cloud service credentials.

### Configuration & Tooling
- Configuration file: [`security/scripts/gitleaks-config.toml`](scripts/gitleaks-config.toml)
- Scan execution script: [`security/scripts/scan-secrets.sh`](scripts/scan-secrets.sh)

### Running Secret Scanning Locally

Before every commit or push, run the scanner from the repository root:

```bash
# Using the automated helper script
bash security/scripts/scan-secrets.sh

# Or directly via gitleaks CLI
gitleaks detect --config security/scripts/gitleaks-config.toml --source . --verbose
```

### Optional: Git Pre-Commit Hook Integration

To automate scanning before every commit, add a hook to `.git/hooks/pre-commit`:

```bash
#!/usr/bin/env bash
bash security/scripts/scan-secrets.sh
if [ $? -ne 0 ]; then
  echo "Commit aborted: secrets detected. Please remove sensitive credentials."
  exit 1
fi
```
Make the hook executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Local Docker Development Environment

The project provides a unified multi-container local development stack defined in [`docker-compose.yml`](../docker-compose.yml).

### Services Orchestrated
- **PostgreSQL 16** (`postgres`): Runs on port `5432` with pre-configured credentials (`postgres:password`), initialized database `sih_db`, and persistent named volume `d-vault-postgres-data`.
- **Backend API** (`backend`): Runs on port `5000`. Built via multi-stage Node 20 Alpine Dockerfile, automatically generates Prisma client code, runs `npx prisma migrate deploy` on startup via entrypoint, and binds to `sih_db`.
- **Frontend Web3** (`frontend`): Runs on port `3000`. Multi-stage Next.js build running under an unprivileged user (`nextjs:nodejs`).
- **Hardhat Node** (`contracts`): Placeholder service available in [`docker-compose.yml`](../docker-compose.yml); uncomment once smart contract workspace is merged.

### Quickstart Commands

```bash
# 1. Build and launch all services in detached mode
docker compose up --build -d

# 2. View streaming logs from all services
docker compose logs -f

# 3. View logs for a specific service (e.g. backend)
docker compose logs -f backend

# 4. Stop all running containers
docker compose down

# 5. Stop and wipe persistent volume data (fresh reset)
docker compose down -v
```

---

## Testnet Deployment & Audit Trail

Protocols and audit tracking for Ethereum Sepolia testnet operations:
- 📋 [Sepolia Deployment Protocol & Checklist](scripts/deploy-sepolia-checklist.md) — Pre-deployment secret safeguards, Hardhat command sequence, environment synchronization (`BLOCKCHAIN_MOCK=false`, `NEXT_PUBLIC_USE_MOCK_DATA=false`), and `ROLE_BYTES32` on-chain hash reconciliation.
- 📜 [Sepolia Deployment Audit Log](reports/sepolia-deployment-log.md) — Official registry of deployed contract addresses (`DIDRegistry`, `RBACContract`, `NFTAsset`), transaction hashes, and reviewer sign-offs.

---

## Live Demo Runbook & Contingencies

For live evaluations and hackathon judge presentations:
- 📖 [Live Demo Runbook & Incident Response Guide](docs/demo-runbook.md) — 24-hour pre-demo hardening protocol, "If X Breaks" fallback contingency matrix (handling wallet disconnection, RPC latency, Pinata rate limits), and step-by-step presentation script.
