"use client";

import { useMemo } from "react";
import { useReadContract } from "wagmi";
import type { Role } from "@/types";
import { mockStore } from "@/mock/store";
import { MOCK_MODE } from "@/config/app";
import { CONTRACT_ADDRESSES, RBAC_ABI, ROLE_ENUM_TO_NAME } from "@/config/contracts";

/**
 * Read the on-chain role for a given address.
 * Mock mode: reads from in-memory store.
 * Real mode: calls rbacContract.roleOf(address) → uint8 → maps to Role string.
 */
export function useUserRole(address: `0x${string}` | null | undefined): {
  role: Role;
  isLoading: boolean;
} {
  const {
    data: roleEnum,
    isLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.rbac,
    abi: RBAC_ABI,
    functionName: "roleOf",
    args: address ? [address] : undefined,
    query: { enabled: !MOCK_MODE && !!address },
  });

  const role = useMemo<Role>(() => {
    if (!address) return "NONE";
    if (MOCK_MODE) return mockStore.getRole(address);
    if (roleEnum === undefined) return "NONE";
    return (ROLE_ENUM_TO_NAME[Number(roleEnum)] ?? "NONE") as Role;
  }, [address, roleEnum]);

  return { role, isLoading: MOCK_MODE ? false : isLoading };
}
