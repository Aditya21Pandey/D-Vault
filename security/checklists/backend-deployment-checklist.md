# Backend Production Deployment Checklist (Render & Managed PostgreSQL)

> [!NOTE]
> **Manual Provisioning Required**: This deployment procedure is designed for manual execution once a team Render account and managed database instance are provisioned. Deploying production infrastructure and managed databases is intentionally kept outside unattended CI pipelines to prevent unexpected cloud billing and unintended schema migrations.

---

## 1. Managed PostgreSQL Setup (Render)

- [ ] **Provision PostgreSQL Instance**:
  1. In the Render Dashboard, click **New +** → **PostgreSQL**.
  2. Set Name: `d-vault-postgres-prod`.
  3. Database: `sih_db`.
  4. User: `sih_admin`.
  5. Select the region closest to your primary user base (e.g., `Singapore` or `Oregon`).
  6. Choose tier (Free / Starter).
- [ ] **Capture Database Connection Strings**:
  - **Internal Database URL**: Use this for the Web Service if hosted in the same Render region (`postgresql://sih_admin:...@d-vault-postgres-prod:5432/sih_db`).
  - **External Database URL**: Use for external migrations or local management via `psql` / Prisma Studio.

---

## 2. Render Web Service Configuration

- [ ] **Create Web Service**:
  1. Click **New +** → **Web Service**.
  2. Connect the GitHub repository `rakshitgarg18/D-Vault`.
  3. Configure Core Settings:
     - **Name**: `d-vault-backend-api`
     - **Region**: Same region as the PostgreSQL instance
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
- [ ] **Build & Start Commands**:
  - **Build Command**:
    ```bash
    npm ci && npm run build && npx prisma migrate deploy
    ```
    *(Installs exact locked dependencies, compiles TypeScript to `dist/`, and applies pending database schema migrations)*.
  - **Start Command**:
    ```bash
    npm start
    ```
    *(Executes `node dist/server.js`)*.
- [ ] **Health Check Path**:
  - Set **Health Check Path** to `/health`.
  - Render will poll `GET /health` to confirm successful application boot before routing live traffic.

---

## 3. Environment Variables Configuration

Populate the following environment variables in the Render Dashboard (**Environment** tab):

| Variable | Value / Format | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & logging |
| `PORT` | `5000` | Port expected by server and reverse proxy |
| `CORS_ORIGIN` | `https://d-vault.vercel.app` | Production frontend domain |
| `DATABASE_URL` | `postgresql://...` | Internal PostgreSQL connection string |
| `JWT_SECRET` | *(64-character random string)* | Secret for signing auth tokens (≥ 16 chars required) |
| `JWT_EXPIRES_IN` | `7d` | Token validity duration |
| `NONCE_TTL_SECONDS` | `300` | Expiration window for SIWE login challenges |
| `BLOCKCHAIN_MOCK` | `false` *(or `true` if pre-contracts)* | Toggles mock blockchain mode |
| `RPC_URL` | `https://sepolia.infura.io/v3/...` | Sepolia JSON-RPC node provider |
| `CHAIN_ID` | `11155111` | Sepolia chain identifier |
| `DID_REGISTRY_ADDRESS` | `0x...` | Deployed DID Registry contract address |
| `RBAC_CONTRACT_ADDRESS` | `0x...` | Deployed RBAC contract address |
| `NFT_ASSET_ADDRESS` | `0x...` | Deployed NFT Asset contract address |
| `IPFS_MOCK` | `false` *(or `true` if no Pinata)* | Toggles mock IPFS mode |
| `PINATA_JWT` | `eyJ...` | Pinata API JWT for IPFS pinning |
| `PINATA_GATEWAY` | `https://gateway.pinata.cloud/ipfs/` | Gateway URL prefix |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15-minute rate limit window |
| `RATE_LIMIT_MAX` | `100` | Global maximum requests per window |
| `AUTH_RATE_LIMIT_MAX` | `10` | Maximum login attempts per window |

---

## 4. Post-Deployment Smoke Verification

1. **Verify Health Endpoint**:
   ```bash
   curl -i https://d-vault-backend-api.onrender.com/health
   ```
   Expect HTTP 200 with:
   ```json
   {
     "success": true,
     "status": "ok",
     "environment": "production",
     "version": "1.0.0"
   }
   ```

2. **Verify Database Connectivity**:
   - Check Render service logs for:
     ```text
     [Database] Connected to PostgreSQL via Prisma
     ```

3. **Verify Auth Flow**:
   - Test nonce generation:
     ```bash
     curl -X POST https://d-vault-backend-api.onrender.com/api/auth/nonce \
       -H "Content-Type: application/json" \
       -d '{"walletAddress":"0x0000000000000000000000000000000000000001"}'
     ```
   - Expect HTTP 200 with a fresh challenge nonce.
