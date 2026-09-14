/**
 * Contract addresses, ABIs, and role enums.
 *
 * Addresses are read from NEXT_PUBLIC_* environment variables.
 * ABIs match the compiled DIDRegistry.sol / RBACManager.sol / NFTAsset.sol.
 * Role enum values match the uint8 constants in RBACManager.sol.
 */
import { sepolia } from "wagmi/chains";

// ─── Addresses ────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  didRegistry: (process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  nft: (process.env.NEXT_PUBLIC_NFT_ADDRESS ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  rbac: (process.env.NEXT_PUBLIC_RBAC_ADDRESS ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
};

export const CONTRACT_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? String(sepolia.id)
);

// ─── Role Enum (uint8 values from RBACManager.sol) ────────────────────────────

export const ROLE_ENUM = {
  NONE:    0,
  ADMIN:   1,
  MANAGER: 2,
  AUDITOR: 3,
  USER:    4,
} as const;

export type RoleEnumKey = keyof typeof ROLE_ENUM;

// Maps the uint8 from the contract back to a Role string
export const ROLE_ENUM_TO_NAME: Record<number, string> = {
  0: "NONE",
  1: "ADMIN",
  2: "MANAGER",
  3: "AUDITOR",
  4: "USER",
};

// ─── RBAC ABI (from RBACManager.sol) ──────────────────────────────────────────

export const RBAC_ABI = [
  {
    name: "roleOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "getRole",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "assignRoleByEnum",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address" },
      { name: "roleEnum", type: "uint8" },
    ],
    outputs: [],
  },
  {
    name: "assignRole",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address" },
      { name: "role", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "revokeRole",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: [],
  },
  {
    name: "isAdmin",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "canMint",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "totalRoleAssignments",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "RoleAssigned",
    type: "event",
    inputs: [
      { name: "account", type: "address", indexed: true },
      { name: "role", type: "bytes32", indexed: true },
      { name: "assignedBy", type: "address", indexed: true },
    ],
  },
] as const;

// ─── DID Registry ABI (from DIDRegistry.sol) ─────────────────────────────────

export const DID_REGISTRY_ABI = [
  {
    name: "getIdentity",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "did", type: "string" },
      { name: "controller", type: "address" },
      { name: "createdAtBlock", type: "uint256" },
      { name: "verified", type: "bool" },
    ],
  },
  {
    name: "getDID",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "registerIdentity",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "did", type: "string" }],
    outputs: [],
  },
  {
    name: "hasIdentity",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "totalIdentities",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "DIDCreated",
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "did", type: "string", indexed: false },
    ],
  },
] as const;

// ─── NFT ABI (from NFTAsset.sol) ─────────────────────────────────────────────

export const NFT_ABI = [
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "nextTokenId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "NFTMinted",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "metadataCID", type: "string", indexed: false },
    ],
  },
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
] as const;
