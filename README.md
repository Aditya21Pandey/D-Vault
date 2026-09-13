# D-Vault

[![Backend CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/frontend-ci.yml)
[![Contracts CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/contracts-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/contracts-ci.yml)

Blockchain-based secure platform for Decentralized Identity (DID), Role-Based Access Control (RBAC), and verifiable digital asset management.

---

## Monorepo Architecture

- **[`backend/`](backend/)**: Node.js & Express REST API built with TypeScript, Prisma ORM, Ethers.js, and SIWE (Sign-In with Ethereum).
- **[`frontend-web3/`](frontend-web3/)**: Modern Web3 user interface built with Next.js 14, TailwindCSS, Wagmi, and RainbowKit.
- **[`security/`](security/)**: Centralized hub for DevOps, security audits, secret scanning, QA scripts, and deployment logs.
- **[`docker-compose.yml`](docker-compose.yml)**: Multi-container local orchestration (PostgreSQL 16, Backend API, Frontend Web3).

---

## Local Development Quickstart

```bash
# 1. Start all services using Docker Compose
docker compose up --build -d

# 2. Access the applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/v1/health
# PostgreSQL: localhost:5432
```

For security auditing, secret scanning, and pre-commit checks, refer to [`security/README.md`](security/README.md).
