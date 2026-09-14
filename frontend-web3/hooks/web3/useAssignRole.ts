"use client";

import { useCallback, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { TxState, Role } from "@/types";
import { mockStore } from "@/mock/store";
import { MOCK_MODE } from "@/config/app";
import { CONTRACT_ADDRESSES, RBAC_ABI, ROLE_ENUM } from "@/config/contracts";

/**
 * Assigns a role to a target address via RBACManager.assignRoleByEnum().
 * Mock mode: updates the in-memory store.
 * Real mode: sends a transaction — only succeeds if the connected wallet is ADMIN.
 */
export function useAssignRole() {
  const { writeContractAsync } = useWriteContract();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const assign = useCallback(
    async (actor: `0x${string}`, target: `0x${string}`, role: Role): Promise<void> => {
      setTxState({ status: "confirm" });
      try {
        if (MOCK_MODE) {
          await new Promise((r) => setTimeout(r, 600));
          setTxState({ status: "pending" });
          await new Promise((r) => setTimeout(r, 1200));
          const evt = mockStore.assignRole(actor, target, role);
          setTxState({ status: "confirmed", txHash: evt.txHash });
          return;
        }

        const roleEnumValue = ROLE_ENUM[role as keyof typeof ROLE_ENUM] ?? ROLE_ENUM.USER;

        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.rbac,
          abi: RBAC_ABI,
          functionName: "assignRoleByEnum",
          args: [target, roleEnumValue],
        });

        setTxHash(hash);
        setTxState({ status: "pending" });
        // isConfirming from useWaitForTransactionReceipt will turn true/false
        setTxState({ status: "confirmed", txHash: hash });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        const isRejected =
          msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied");
        setTxState({ status: isRejected ? "rejected" : "failed", error: msg });
      }
    },
    [writeContractAsync]
  );

  const reset = useCallback(() => {
    setTxState({ status: "idle" });
    setTxHash(undefined);
  }, []);

  return { assign, txState, isConfirming, reset };
}

/**
 * Revokes the role of a target address via RBACManager.revokeRole().
 * Only callable by ADMIN.
 */
export function useRevokeRole() {
  const { writeContractAsync } = useWriteContract();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const revoke = useCallback(
    async (target: `0x${string}`): Promise<void> => {
      setTxState({ status: "confirm" });
      try {
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.rbac,
          abi: RBAC_ABI,
          functionName: "revokeRole",
          args: [target],
        });
        setTxState({ status: "confirmed", txHash: hash });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        const isRejected =
          msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied");
        setTxState({ status: isRejected ? "rejected" : "failed", error: msg });
      }
    },
    [writeContractAsync]
  );

  const reset = useCallback(() => setTxState({ status: "idle" }), []);

  return { revoke, txState, reset };
}
