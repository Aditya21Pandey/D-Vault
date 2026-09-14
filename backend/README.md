# SIH 2026 — Backend API
### Blockchain-Based Secure Platform for Identity, Access Control & Digital Asset Management
**Problem Statement ID: 26125 | Organisation: Bharat Electronics Limited**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js + TypeScript |
| Database | PostgreSQL + Prisma ORM (v5) |
| Blockchain | ethers.js v6 (Ethereum Sepolia) |
| IPFS | Pinata REST API |
| Auth | SIWE-inspired nonce challenge + JWT |
| Validation | express-validator + Zod (env only) |
| Security | Helmet, express-rate-limit, CORS |
| File Upload | multer v2 (memory storage, 10 MB) |
| Tests | Jest + Supertest (16 tests) |

---

## Monorepo Architecture

- **[`backend/`](../backend/)**: Node.js & Express REST API built with TypeScript, Prisma ORM, Ethers.js, SIWE, and Google OAuth.
- **[`frontend/`](../frontend/)**: **(Active)** Modern Web3 UI built with Next.js, featuring wallet connection and Google Sign-In.
- **[`frontend-web3/`](../frontend-web3/)**: **(Deprecated)** Legacy frontend implementation.
- **[`security/`](../security/)**: Security audits, secret scanning, and QA scripts.
- **[`docker-compose.yml`](../docker-compose.yml)**: Multi-container local orchestration (PostgreSQL 16, Backend API, Frontend).

---

## Local Development Quickstart

### 1. Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and JWT_SECRET
```
Add Google Auth and Whitelists:
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
> **Note:** To enable Google Sign-In, obtain a Client ID from the [Google Cloud Console](https://console.cloud.google.com). Add `http://localhost:3000` to the **Authorized JavaScript origins**.

### 2. Start Services (Docker)
```bash
# In the repository root
docker compose up --build -d
```

### 3. Setup Database (Backend)
```bash
cd backend
npm install
npx prisma migrate dev    # creates all tables and schema
npm run prisma:seed       # seeds: ADMIN, MANAGER, AUDITOR, USER roles
```

### 4. Run Development Servers
**Backend:**
```bash
cd backend
npm run dev
# Server starts at: http://localhost:5000
# Health check: http://localhost:5000/health
```

**Frontend:**
```bash
cd ../frontend
pnpm install
pnpm dev
# Frontend starts at: http://localhost:3000
```

### 5. Run tests (Backend)
```bash
cd backend
npm test
# → 16 passed, 2 suites
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | JWT signing secret (min 16 chars) |
| `JWT_EXPIRES_IN` | — | `7d` | JWT expiry |
| `NONCE_TTL_SECONDS` | — | `300` | Login challenge expiry (5 min) |
| `BLOCKCHAIN_MOCK` | — | `true` | Use mock blockchain reads (no RPC needed) |
| `RPC_URL` | ⚠️ | — | Sepolia RPC URL — required if `BLOCKCHAIN_MOCK=false` |
| `CHAIN_ID` | — | `11155111` | Ethereum chain ID (Sepolia) |
| `DID_REGISTRY_ADDRESS` | ⚠️ | — | Deployed DID Registry contract address |
| `RBAC_CONTRACT_ADDRESS` | ⚠️ | — | Deployed RBAC contract address |
| `NFT_ASSET_ADDRESS` | ⚠️ | — | Deployed NFT contract address |
| `IPFS_MOCK` | — | `false` | Use mock IPFS (returns fake CIDs) |
| `PINATA_JWT` | ⚠️ | — | Pinata JWT — required if `IPFS_MOCK=false` |
| `PINATA_GATEWAY` | — | `https://gateway.pinata.cloud/ipfs/` | IPFS HTTP gateway |
| `CORS_ORIGIN` | — | `http://localhost:3000` | Allowed frontend origin |
| `PORT` | — | `5000` | Server port |
| `RATE_LIMIT_MAX` | — | `100` | Global req/window |
| `AUTH_RATE_LIMIT_MAX` | — | `10` | Auth route req/window |

> ⚠️ = only required when the corresponding mock flag is `false`

---

## REST API Reference

### Auth (Public)

```
POST /api/auth/nonce
  Body: { walletAddress: "0x..." }
  Response: { nonce, message, expiresAt }

POST /api/auth/verify
  Body: { walletAddress: "0x...", signature: "0x..." }
  Response: { token, expiresIn }

GET /api/auth/me   [JWT required]
  Response: { userId, walletAddress, did, role }
```

### Users `[JWT required]`

```
GET /api/users/:address        → { id, walletAddress, did, roles, primaryRole }
GET /api/users/:address/did    → { walletAddress, did }
```

### Roles

```
POST /api/roles/assign  [ADMIN only]
  Body: { walletAddress: "0x...", role: "MANAGER" }
  Response: { walletAddress, role, assignedBy }

GET /api/roles/:address [JWT]   → { walletAddress, roles, primaryRole }
```

### Assets

```
POST /api/assets/metadata  [MANAGER | ADMIN]
  Multipart form: name, description, assetType, ownerDID (optional), file (optional image/PDF ≤10MB)
  Response: { cid, ipfsUri, metadata, metadataUploadStatus: "uploaded" }

GET  /api/assets              [JWT]   ?page=1&limit=20&ownerAddress=0x...
GET  /api/assets/:tokenId     [JWT]
GET  /api/assets/:tokenId/history [JWT]
```

### Audit

```
GET /api/audit  [AUDITOR | ADMIN]
  ?page=1&limit=20&eventType=NFTMinted&actorAddress=0x...
  Response: AuditEvent[]
```

### System

```
GET /health   → { status: "ok", uptime, timestamp }
```

---

## Authentication Flow

```
1.  Frontend  →  POST /api/auth/nonce  { walletAddress }
2.  Backend   ←  { nonce, message }
3.  Frontend  →  wallet.signMessage(message)   ← MetaMask / ethers.js
4.  Frontend  →  POST /api/auth/verify { walletAddress, signature }
5.  Backend   ←  { token, expiresIn }
6.  Frontend  →  Authorization: Bearer <token>   (all subsequent requests)
```

> The sign message format is deterministic (no timestamp) so the backend can reconstruct it exactly on verify.

---

## NFT Minting Flow

```
MANAGER → POST /api/assets/metadata   (validate + upload to IPFS)
        ←  { cid, ipfsUri }
MANAGER → wallet.signAndSend( nftContract.mint(cid, ownerDID) )   ← MetaMask
        → Smart Contract emits NFTMinted(tokenId, owner, metadataCID)
Backend Indexer → picks up event → writes confirmed Asset + AuditEvent to DB
USER    → GET /api/assets   ← confirmed asset appears
```

> ⚠️ The backend **never holds private keys** and **never calls mint()**. NFT minting is always signed by the wallet in the browser.

---

## RBAC Role Matrix

| Role | Assign Roles | Upload Metadata | Read Audit | Read Assets/Users |
|---|---|---|---|---|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ❌ | ✅ | ❌ | ✅ |
| AUDITOR | ❌ | ❌ | ✅ | ✅ |
| USER | ❌ | ❌ | ❌ | ✅ |

---

## Connecting Real Smart Contracts

When the blockchain team deploys contracts on Sepolia:

1. **Copy real ABIs** into `backend/abis/`:
   - `DIDRegistry.json`
   - `RBACContract.json`
   - `NFTAsset.json`

2. **Update `.env`**:
```env
BLOCKCHAIN_MOCK=false
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
DID_REGISTRY_ADDRESS=0x...
RBAC_CONTRACT_ADDRESS=0x...
NFT_ASSET_ADDRESS=0x...
```

3. **Update `src/config/contracts.ts`** — set the correct `ROLE_BYTES32` hashes to match your contract's `keccak256(roleName)` values.

---

## Connecting Pinata IPFS

1. Create an API key at [app.pinata.cloud/keys](https://app.pinata.cloud/keys)
2. **Update `.env`**:
```env
IPFS_MOCK=false
PINATA_JWT=eyJhbGc...
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/          env.ts, contracts.ts
│   ├── routes/          auth, user, role, asset, audit
│   ├── controllers/     auth, user, role, asset, audit
│   ├── services/        auth, user, role, asset, blockchain, ipfs
│   ├── middleware/       auth, rbac, validation, error
│   ├── blockchain/      provider, contracts, eventListener
│   ├── db/              prisma.ts, __mocks__/prisma.ts
│   ├── types/           index.ts
│   ├── utils/           logger.ts
│   ├── app.ts
│   └── server.ts
├── prisma/              schema.prisma (8 models), seed.ts
├── abis/                DIDRegistry, RBACContract, NFTAsset (mock → swap with real)
├── tests/               auth.test.ts (6), rbac.test.ts (10), setup.ts
├── .env                 (BLOCKCHAIN_MOCK=true, IPFS_MOCK=true by default)
├── .env.example
├── jest.config.ts
└── README.md
```

---

## npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with ts-node-dev (hot reload) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm test` | Run Jest test suite |
| `npm run prisma:migrate` | Apply DB migrations |
| `npm run prisma:seed` | Seed roles + indexer state |
| `npm run prisma:studio` | Open Prisma Studio (DB GUI) |
