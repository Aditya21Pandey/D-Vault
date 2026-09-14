"use client";

import { useMemo } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Identity, DIDDocument } from "@/types";
import { mockStore } from "@/mock/store";
import { MOCK_MODE } from "@/config/app";
import { CONTRACT_ADDRESSES, DID_REGISTRY_ABI } from "@/config/contracts";
import { useCallback, useState } from "react";
import type { TxState } from "@/types";

/**
 * Fetches the DID identity for a given address.
 * Mock mode: reads from in-memory store.
 * Real mode: calls didRegistry.getIdentity(address) on-chain.
 */
export function useUserIdentity(address: `0x${string}` | null | undefined): {
  identity: Identity | null;
  didDocument: DIDDocument | null;
  isLoading: boolean;
  error: string | null;
} {
  const {
    data: identityData,
    isLoading,
    error: contractError,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.didRegistry,
    abi: DID_REGISTRY_ABI,
    functionName: "getIdentity",
    args: address ? [address] : undefined,
    query: { enabled: !MOCK_MODE && !!address },
  });

  const identity = useMemo<Identity | null>(() => {
    if (!address) return null;
    if (MOCK_MODE) return mockStore.getIdentity(address);
    if (!identityData) return null;

    // identityData = [did, controller, createdAtBlock, verified]
    const [did, controller, createdAtBlock, verified] = identityData as [
      string,
      string,
      bigint,
      boolean,
    ];
    if (!did) return null;

    return {
      address,
      did,
      controller,
      verified,
      createdAt: Number(createdAtBlock),
    } as unknown as Identity;
  }, [address, identityData]);

  const didDocument = useMemo<DIDDocument | null>(() => {
    if (!address) return null;
    if (MOCK_MODE) return mockStore.getDIDDocument(address);
    if (!identity) return null;
    // Minimal DID document derived from on-chain data
    return {
      id: identity.did,
      controller: (identity as unknown as { controller: string }).controller,
    } as unknown as DIDDocument;
  }, [address, identity]);

  return {
    identity,
    didDocument,
    isLoading: MOCK_MODE ? false : isLoading,
    error: contractError ? contractError.message : null,
  };
}

/**
 * Register a DID on-chain via DIDRegistry.registerIdentity(did).
 * Wallet must be connected. The DID string is derived from the address.
 */
export function useRegisterIdentity() {
  const { writeContractAsync } = useWriteContract();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const register = useCallback(
    async (address: `0x${string}`) => {
      setTxState({ status: "confirm" });
      try {
        const did = `did:ethr:${address.toLowerCase()}`;
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.didRegistry,
          abi: DID_REGISTRY_ABI,
          functionName: "registerIdentity",
          args: [did],
        });
        setTxHash(hash);
        setTxState({ status: "pending" });
        setTxState({ status: "confirmed", txHash: hash });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        const isRejected = msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied");
        setTxState({ status: isRejected ? "rejected" : "failed", error: msg });
      }
    },
    [writeContractAsync]
  );

  const reset = useCallback(() => {
    setTxState({ status: "idle" });
    setTxHash(undefined);
  }, []);

  return { register, txState, isConfirming, reset };
}
