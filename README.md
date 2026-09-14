# D-Vault

[![Backend CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/frontend-ci.yml)
[![Contracts CI](https://github.com/rakshitgarg18/D-Vault/actions/workflows/contracts-ci.yml/badge.svg)](https://github.com/rakshitgarg18/D-Vault/actions/workflows/contracts-ci.yml)

Blockchain-based secure platform for Decentralized Identity (DID), Role-Based Access Control (RBAC), and verifiable digital asset management.

---

## Monorepo Architecture

- **[`backend/`](backend/)**: Node.js & Express REST API built with TypeScript, Prisma ORM, Ethers.js, SIWE (Sign-In with Ethereum), and Google OAuth.
- **[`frontend/`](frontend/)**: **(Active)** Modern Web3 user interface built with Next.js, featuring a clean aesthetic, wallet connection, and Google Sign-In support.
- **[`frontend-web3/`](frontend-web3/)**: **(Deprecated)** Legacy frontend implementation.
- **[`security/`](security/)**: Centralized hub for DevOps, security audits, secret scanning, QA scripts, and deployment logs.
- **[`docker-compose.yml`](docker-compose.yml)**: Multi-container local orchestration (PostgreSQL 16, Backend API, Frontend).

---

## Local Development Quickstart

### 1. Configure Environment Variables

**Backend (`backend/.env`):**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ADMIN_EMAILS=admin@gmail.com,owner@gmail.com
MANAGER_EMAILS=manager@gmail.com
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> **Note:** To enable Google Sign-In, you must obtain a Client ID from the [Google Cloud Console](https://console.cloud.google.com). Add `http://localhost:3000` to the **Authorized JavaScript origins**.

### 2. Start Services
```bash
# Start all services using Docker Compose
docker compose up --build -d

# Important: After the database is up, run Prisma migrations to apply the schema
cd backend
npx prisma migrate dev
```

### 3. Access the applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health
- **PostgreSQL**: localhost:5432

For security auditing, secret scanning, and pre-commit checks, refer to [`security/README.md`](security/README.md).
