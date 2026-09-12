# Sepolia Testnet Deployment Protocol & Checklist

This document details the step-by-step procedure for deploying smart contracts to the **Ethereum Sepolia Testnet**, synchronizing backend and frontend environments, and logging deployment artifacts for security audits.

---

## 1. Pre-Deployment Secret Verification

> [!CAUTION]
> **Zero Credential Leak Policy**: Never store deployer private keys or raw RPC API keys in source control. All secrets must be passed via local `.env` (gitignored) or GitHub Actions Secrets.

- [ ] **GitHub Actions Secrets / Local `.env` Configured**:
  - `SEPOLIA_RPC_URL`: Dedicated Alchemy/Infura endpoint (e.g., `https://eth-sepolia.g.alchemy.com/v2/...`).
  - `DEPLOYER_PRIVATE_KEY`: Private key of the dedicated deployer wallet.
  - `ETHERSCAN_API_KEY`: API key for automated Etherscan source verification.
- [ ] **Deployer Balance Verification**:
  - Verify that the deployer address has at least **0.1 Sepolia ETH** for deployment and initialization gas fees. (Obtain testnet ETH via Sepolia faucets if needed).

---

## 2. Deployment Execution (`contracts/`)

Run the Hardhat deployment script targeting the Sepolia network:

```bash
cd contracts/
npx hardhat run scripts/deploy.js --network sepolia
```

Record the stdout log containing contract addresses and deployment transaction hashes:
- `DIDRegistry` deployed address
- `RBACContract` deployed address
- `NFTAsset` deployed address

Verify contracts on Etherscan:
```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## 3. Environment Synchronization

### 3.1 Backend Configuration (`backend/.env`)

Update `backend/.env` with the deployed addresses and transition out of mock mode:

```ini
# Contract Addresses (Sepolia)
DID_REGISTRY_ADDRESS=0x...
RBAC_CONTRACT_ADDRESS=0x...
NFT_ASSET_ADDRESS=0x...

# Disable Mocks
BLOCKCHAIN_MOCK=false
```

### 3.2 Frontend Configuration (`frontend-web3/.env.local`)

Update `frontend-web3/.env.local` to bind Wagmi and RainbowKit to real contracts:

```ini
NEXT_PUBLIC_DID_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_RBAC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NFT_ASSET_ADDRESS=0x...

# Disable Frontend Mock Mode
NEXT_PUBLIC_USE_MOCK_DATA=false
```

---

## 4. Critical Bug & Alignment Check: `ROLE_BYTES32`

> [!WARNING]
> **Known Issue / Coordination Required with Blockchain Engineer**:
> The `ROLE_BYTES32` constants defined in [`backend/src/config/contracts.ts`](../../backend/src/config/contracts.ts) are placeholders. Before switching `BLOCKCHAIN_MOCK=false`, these hashes **must** be reconciled with the exact keccak256 role hashes implemented in `RBACContract.sol`.
>
> Example standard computation:
> ```solidity
> bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
> bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
> bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
> ```
> Update `backend/src/config/contracts.ts` with the actual on-chain role hashes to prevent role assignment and authorization failures.

---

## 5. Post-Deployment Verification & Audit Logging

- [ ] Execute `security/reports/sepolia-deployment-log.md` updates (see Section 6).
- [ ] Run backend health check: `curl http://localhost:5000/health`.
- [ ] Perform live authentication and role check using real Sepolia testnet transactions.
- [ ] Verify that contract events are captured in PostgreSQL via `backend/src/blockchain/eventListener.ts`.
