import { env } from '../config/env';

export const CONTRACT_CONFIG = {
  DID_REGISTRY: {
    address: env.DID_REGISTRY_ADDRESS,
    abiPath: '../abis/DIDRegistry.json',
  },
  RBAC_CONTRACT: {
    address: env.RBAC_CONTRACT_ADDRESS,
    abiPath: '../abis/RBACContract.json',
  },
  NFT_ASSET: {
    address: env.NFT_ASSET_ADDRESS,
    abiPath: '../abis/NFTAsset.json',
  },
} as const;

/**
 * On-chain role identifiers (bytes32 constants from the RBAC contract).
 * Update these to match the actual keccak256 hashes used by the smart contract.
 * e.g., ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"))
 */
export const ROLE_BYTES32 = {
  ADMIN:   '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775',
  MANAGER: '0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08',
  AUDITOR: '0x59a1c48e5837ad7a7f3dcedcbe129bf3249ec4fbf651fd4f5e2600ead39fe2f5',
  USER:    '0x14823911f2da1b49f045a0929a60b8c1f2a7fc8c06c7284ca3e8ab4e193a08c8',
} as const;

export type OnChainRole = keyof typeof ROLE_BYTES32;
