# Live Demonstration Runbook & Incident Contingency Guide

This document serves as the high-stakes operational guide for presenting the **D-Vault (SIH Platform)** live to evaluators, judges, and stakeholders. It outlines mandatory pre-demo hardening steps, incident response protocols, and rapid fallback mechanisms.

---

## 1. Architectural Philosophy: The Mock Safety Net

Web3 live demonstrations frequently suffer from external dependencies beyond the presenter's control:
- Public testnet JSON-RPC node rate limits or chain congestion (Sepolia).
- Browser extension wallet crashes or pop-up blocking (MetaMask / Rainbow).
- Decentralized storage pinning delays (IPFS / Pinata).

**D-Vault is intentionally built with a dual-layer, zero-downtime mock infrastructure** across both the backend API and frontend Next.js application. If any decentralized infrastructure degrades during a presentation, the presenter can switch to mock mode in seconds without breaking user flows.

---

## 2. Pre-Demo Hardening Checklist (24 Hours Prior)

Complete this protocol 24 hours and 1 hour before presenting:

- [ ] **1. Fresh Dependency Audit**:
  ```bash
  cd backend && npm audit --audit-level=high
  cd ../frontend-web3 && npm audit --audit-level=high
  ```
  *(Reference [`security/checklists/dependency-audit-checklist.md`](../checklists/dependency-audit-checklist.md) to triage any critical vulnerabilities)*.

- [ ] **2. Execute Complete Test Suite**:
  ```bash
  cd backend && npm test
  ```
  *Ensure all 3 test suites (`auth.test.ts`, `rbac.test.ts`, `integration.journey.test.ts`) pass 100% (19/19 tests passing)*.

- [ ] **3. Verify Code Integrity & Linting**:
  ```bash
  cd backend && npm run lint
  cd ../frontend-web3 && npm run lint
  ```
  *Confirm 0 errors and 0 warnings*.

- [ ] **4. Verify Sepolia Testnet State (If Live Mode)**:
  - Check deployer wallet balance (ensure ≥ 0.05 Sepolia ETH).
  - Verify deployed contract addresses in `backend/.env` and `frontend-web3/.env.local`.
  - Confirm Sepolia RPC provider endpoint is responding:
    ```bash
    curl -X POST $RPC_URL -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
    ```

- [ ] **5. Pinata IPFS Gateway Check**:
  - Verify that `PINATA_JWT` is populated and active.
  - Verify gateway response at `https://gateway.pinata.cloud/ipfs/`.

- [ ] **6. Docker & Database Service Health**:
  ```bash
  docker compose ps
  curl http://localhost:5000/health
  ```
  *Confirm HTTP 200 with status `ok`*.

---

## 3. "If X Breaks During Demo" — Incident Response Matrix

| Failure Mode | Root Cause / Symptom | Live Fallback Action | Explanation to Evaluators |
| :--- | :--- | :--- | :--- |
| **Wallet Extension Fails** | MetaMask crashes, pop-up blocked, or user rejects signature | Switch to **`MOCK_MODE` personas** in `frontend-web3/lib/web3/demoAuth.tsx`. Use UI persona switcher (`Admin`, `Manager`, `Auditor`, `User`). | *"To demonstrate multi-party RBAC without browser extension pop-up delays, we can switch instantly between simulated wallet personas via our non-custodial test harness."* |
| **Sepolia RPC Unresponsive** | Infura/Alchemy 429 rate limit, slow block inclusion, or reorgs | Set `BLOCKCHAIN_MOCK=true` in `backend/.env` and restart backend process (`npm start` or container restart). | *"The Sepolia testnet is currently experiencing latency; switching our gateway's deterministic EVM abstraction layer demonstrates full end-to-end functionality instantly."* |
| **Pinata / IPFS Rate Limited** | Pinata API timeout or HTTP 504 gateway response | Set `IPFS_MOCK=true` in `backend/.env` and restart backend. | *"Decentralized pinning gateway is undergoing high load; our backend IPFS service safely falls back to deterministic SHA-256 CID generation without blocking the asset pipeline."* |
| **Database Disconnects** | PostgreSQL container stops or connection pool exhausted | Run `docker compose restart postgres` followed by `curl localhost:5000/health`. | Quick 5-second container restart. |

---

## 4. Rapid Mock-Mode Toggling Guide

To toggle mock mode during a demo, follow these exact settings:

### Backend Gateway (`backend/.env`)

```ini
# Toggle Blockchain Emulation
BLOCKCHAIN_MOCK=true

# Toggle IPFS Pinning Emulation
IPFS_MOCK=true
```
- **How to Apply**: Save file and restart the server process (`Ctrl+C` then `npm start`, or `docker compose restart backend`).
- **Downtime**: ~2 seconds.

### Frontend Web3 Application (`frontend-web3/.env.local`)

```ini
# Toggle Frontend Mock Personas & Data Store
NEXT_PUBLIC_USE_MOCK_DATA=true
```
- **How to Apply**:
  - Local Dev Server: Next.js hot-reloads on `.env.local` edits (or restart `npm run dev`).
  - Production (Vercel): Set Environment Variable in Vercel project dashboard and trigger redeploy.
- **Downtime**: Instant in local development.

---

## 5. Recommended Live Demo Script (Step-by-Step)

1. **Architecture Introduction (30 sec)**:
   - Highlight the hybrid decentralized architecture: Sepolia for DID registry and on-chain RBAC; IPFS for decentralized metadata; PostgreSQL + Express for off-chain indexing and high-throughput query caching.
2. **Admin Phase (1 min)**:
   - Authenticate with Admin wallet via SIWE nonce challenge.
   - Assign `MANAGER` role to candidate wallet address.
3. **Manager Phase (1 min)**:
   - Switch to Manager wallet.
   - Upload asset certificate (`LAND_TITLE` or `DEGREE_CERTIFICATE`).
   - Demonstrate metadata preparation and preview generated IPFS CID and URI.
4. **Audit Trail Verification (1 min)**:
   - Authenticate with Auditor wallet.
   - Navigate to `/audit` log. Show tamper-proof event records with on-chain transaction hashes, block numbers, and actor addresses.
