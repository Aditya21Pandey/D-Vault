# Smart Contract Security Verification Checklist

This checklist defines mandatory security review items to manually audit and verify once the smart contracts (`contracts/`) are added to the repository by the Blockchain Engineer.

---

## 1. Access Control & RBAC Alignment

Verify that contract access-control modifiers precisely match the role-based architecture established in the backend API and frontend:

- [ ] **Role Hash Constants Alignment**:
  Ensure the `keccak256` role identifiers in `RBACContract.sol` match the constants configured in [`backend/src/config/contracts.ts`](../../backend/src/config/contracts.ts):
  - `ADMIN`: `0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42`
  - `MANAGER`: `0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0813f4f0ac994e5da3a81a7`
  - `AUDITOR`: `0x9cf85f95575c3af1e116e3d37fd41e7f36a8a489ad1ae7f4f07c7d40aad0a7ae`
  - `USER`: `0x2db9fd3d099848027c2383d0a083396f6c41510d7acfd92adc99b6cffcf31e96`
- [ ] **Restricted Role Assignment**:
  Only accounts with `ADMIN_ROLE` can invoke `grantRole()`, `revokeRole()`, or `assignRole()`.
- [ ] **Restricted Minting Functionality**:
  In `NFTAsset.sol`, ensure only accounts holding `MANAGER_ROLE` (or `ADMIN_ROLE`) can invoke `mint()` / `mintToDID()`.
- [ ] **Zero-Address Checks**:
  Verify that role assignment and mint functions reject `address(0)` as a target or recipient.
- [ ] **Default Admin Separation**:
  Ensure the contract deployer does not indefinitely retain unilateral emergency power without timelock or multisig safeguards.

---

## 2. Reentrancy & External Calls

- [ ] **OpenZeppelin ReentrancyGuard**:
  Verify that all external or public state-modifying functions use the `nonReentrant` modifier (especially functions that call external tokens or interact with `IERC721Receiver.onERC721Received`).
- [ ] **Checks-Effects-Interactions Pattern**:
  Ensure internal state changes (e.g. updating token ownership, incrementing token IDs, modifying balances) are committed *prior* to external contract calls.
- [ ] **Safe Mint Usage**:
  When using `_safeMint()` instead of `_mint()`, verify that the callback to the recipient contract cannot re-enter into minting or permission-granting routines.

---

## 3. Arithmetic & Type Safety

- [ ] **Solidity Version**:
  Verify that contracts specify `pragma solidity ^0.8.20;` or later to leverage native compiler overflow/underflow reverts.
- [ ] **Audit `unchecked` Blocks**:
  Inspect all `unchecked { ... }` blocks (often used in loop iterators) to ensure no integer wraparound is exploitable.
- [ ] **Safe Type Casting**:
  Verify that explicit casts between integer sizes (e.g. `uint256` to `uint64` or `uint8`) cannot truncate high-order bits.

---

## 4. Front-Running & MEV Vectors

- [ ] **Role Assignment Front-Running**:
  Review if an admin revoking or assigning a role can be front-run by a rogue actor in the public mempool (e.g. rushing to execute high-privilege actions before a revocation transaction confirms).
  - *Mitigation*: Consider private RPC relays (e.g. Flashbots Protect) for admin transactions on public networks.
- [ ] **Token ID & Metadata Predetermination**:
  Ensure token IDs or metadata CIDs cannot be hijacked or pre-minted by an eavesdropping actor observing unconfirmed transactions in the mempool.

---

## 5. Event Emissions for Indexer Synchronization

The off-chain backend listener (`backend/src/blockchain/eventListener.ts`) depends strictly on emitted contract events to synchronize PostgreSQL:

- [ ] **`RoleAssigned(address indexed account, bytes32 indexed role, address indexed assignedBy)`**:
  Emitted on all RBAC modifications.
- [ ] **`NFTMinted(uint256 indexed tokenId, address indexed owner, string metadataCID)`**:
  Emitted upon ERC-721 token issuance.
- [ ] **`Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`**:
  Standard ERC-721 transfer event.
- [ ] **`DIDCreated(address indexed identity, string did)`**:
  Emitted when an identity is registered in the DID Registry.
- [ ] **Indexed Fields**:
  Confirm that addresses and token IDs are marked `indexed` to enable filtering by the backend JSON-RPC provider.

---

## 6. Upgradeability & Proxy Safety (If Applicable)

- [ ] If using UUPS or Transparent Proxies:
  - Initializers replace constructors (`initialize` protected by `initializer` modifier).
  - No storage collision between implementation upgrades.
  - Storage gap (`uint256[50] __gap;`) reserved for upgradeable state variable additions.

---

## Verification Sign-Off Protocol

| Check | Reviewer | Date | Status |
| :--- | :--- | :--- | :--- |
| **Slither Static Analysis Clean** | CI / Automated | *Pending* | Pre-built in `.github/workflows/contracts-ci.yml` |
| **Hardhat Unit Test Coverage > 90%** | Blockchain Lead | *Pending* | Required before Testnet Deploy |
| **Access Control & RBAC Matrix** | Security Lead | *Pending* | Verify against `ROLE_BYTES32` |
| **Sepolia Deploy & Verification** | DevOps / Team | *Pending* | Etherscan verified contract source |
