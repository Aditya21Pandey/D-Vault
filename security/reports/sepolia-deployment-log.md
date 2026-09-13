# Sepolia Testnet Deployment Audit Log

This document serves as the immutable audit record of smart contract deployments to the Ethereum Sepolia Testnet for the D-Vault platform.

---

## 1. Deployment Metadata

| Attribute | Value |
| :--- | :--- |
| **Target Network** | Ethereum Sepolia Testnet |
| **Chain ID** | `11155111` |
| **Deployment Timestamp** | *Pending Contract Land* |
| **Deployer Wallet Address** | *Pending Deployment* |
| **Hardhat Version** | `^2.22.x` |
| **Solidity Compiler Version** | `0.8.24` |
| **Etherscan Verification** | *Pending* |

---

## 2. Deployed Contract Addresses & Transactions

| Contract Name | Deployed Address | Deployment Tx Hash | Block Number | Etherscan Link |
| :--- | :--- | :--- | :--- | :--- |
| **`DIDRegistry`** | `0x0000000000000000000000000000000000000000` | `0x...` | *Pending* | [Sepolia Etherscan](https://sepolia.etherscan.io/) |
| **`RBACContract`** | `0x0000000000000000000000000000000000000000` | `0x...` | *Pending* | [Sepolia Etherscan](https://sepolia.etherscan.io/) |
| **`NFTAsset`** | `0x0000000000000000000000000000000000000000` | `0x...` | *Pending* | [Sepolia Etherscan](https://sepolia.etherscan.io/) |

---

## 3. On-Chain Role Identifier Verification (`ROLE_BYTES32`)

The following keccak256 hashes must be verified directly against the deployed `RBACContract`:

| Role Name | Expected Identifier | On-Chain Verified Hash | Status |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `keccak256("ADMIN_ROLE")` | *Pending confirmation with Blockchain Lead* | ⚠️ Placeholder in `backend/src/config/contracts.ts` |
| **MANAGER** | `keccak256("MANAGER_ROLE")` | *Pending confirmation with Blockchain Lead* | ⚠️ Placeholder in `backend/src/config/contracts.ts` |
| **AUDITOR** | `keccak256("AUDITOR_ROLE")` | *Pending confirmation with Blockchain Lead* | ⚠️ Placeholder in `backend/src/config/contracts.ts` |
| **USER** | `keccak256("USER_ROLE")` | *Pending confirmation with Blockchain Lead* | ⚠️ Placeholder in `backend/src/config/contracts.ts` |

---

## 4. Environment Transition Checklist

- [ ] `backend/.env` updated with real addresses.
- [ ] `backend/.env` set `BLOCKCHAIN_MOCK=false`.
- [ ] `frontend-web3/.env.local` updated with `NEXT_PUBLIC_*` addresses.
- [ ] `frontend-web3/.env.local` set `NEXT_PUBLIC_USE_MOCK_DATA=false`.
- [ ] Event listener (`backend/src/blockchain/eventListener.ts`) initialized and listening on Sepolia RPC.

---

## 5. Audit Sign-Off

- **Blockchain Engineer**: ___________________ (Date: ________)
- **DevOps & Security Lead**: ___________________ (Date: ________)
