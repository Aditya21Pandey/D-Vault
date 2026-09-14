"use client";

import { useCallback, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { TxState, NFTAsset } from "@/types";
import { mockStore } from "@/mock/store";
import { MOCK_MODE, API_URL } from "@/config/app";
import { CONTRACT_ADDRESSES, NFT_ABI } from "@/config/contracts";
import { getAuthToken } from "@/lib/web3/authStorage";

export interface MintParams {
  actor: `0x${string}`;
  recipientAddress: `0x${string}`;
  recipientDid: string;
  name: string;
  description: string;
  assetType?: string;
  metadataUri?: string;
}

/**
 * Mints an NFT asset.
 *
 * Real mode flow:
 *   1. POST /api/assets/prepare-metadata to backend → get IPFS CID
 *   2. Call NFTAsset.mint(recipient, ipfs://CID) via the connected wallet
 *   3. Backend event-indexer catches the NFTMinted event and stores it in DB
 *
 * Smart contract enforces who can mint (Admin / Manager only).
 */
export function useMintAsset() {
  const { writeContractAsync } = useWriteContract();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [mintedAsset, setMintedAsset] = useState<NFTAsset | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const mint = useCallback(
    async (params: MintParams): Promise<void> => {
      setTxState({ status: "confirm" });
      try {
        if (MOCK_MODE) {
          await new Promise((r) => setTimeout(r, 600));
          setTxState({ status: "pending" });
          await new Promise((r) => setTimeout(r, 1500));
          const asset = mockStore.mintAsset(
            params.actor,
            params.recipientDid,
            params.recipientAddress,
            params.name,
            params.description,
            params.metadataUri ?? `ipfs://pending-${Date.now()}`
          );
          setMintedAsset(asset);
          setTxState({ status: "confirmed", txHash: asset.mintTx });
          return;
        }

        // ── Step 1: Upload metadata to IPFS via backend ──
        const token = getAuthToken();
        const metaRes = await fetch(`${API_URL}/api/assets/prepare-metadata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: params.name,
            description: params.description,
            assetType: params.assetType ?? "document",
            ownerDID: params.recipientDid,
          }),
        });

        if (!metaRes.ok) {
          const err = await metaRes.json().catch(() => ({}));
          throw new Error(err.message ?? "Failed to upload metadata to IPFS");
        }

        const { cid } = (await metaRes.json()) as { cid: string; ipfsUri: string };
        const ipfsUri = `ipfs://${cid}`;

        // ── Step 2: Call NFTAsset.mint(recipient, ipfsUri) ──
        setTxState({ status: "pending" });
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.nft,
          abi: NFT_ABI,
          functionName: "mint",
          args: [params.recipientAddress, ipfsUri],
        });

        setTxHash(hash);
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
    setMintedAsset(null);
    setTxHash(undefined);
  }, []);

  return { mint, txState, mintedAsset, isConfirming, reset };
}

export interface TransferParams {
  actor: `0x${string}`;
  tokenId: string;
  toAddress: `0x${string}`;
  toDid: string;
}

/**
 * Transfers an NFT to a new owner via ERC-721 transferFrom.
 */
export function useTransferAsset() {
  const { writeContractAsync } = useWriteContract();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const transfer = useCallback(
    async (params: TransferParams): Promise<void> => {
      setTxState({ status: "confirm" });
      try {
        if (MOCK_MODE) {
          await new Promise((r) => setTimeout(r, 600));
          setTxState({ status: "pending" });
          await new Promise((r) => setTimeout(r, 1200));
          mockStore.transferAsset(params.actor, params.tokenId, params.toAddress, params.toDid);
          setTxState({ status: "confirmed" });
          return;
        }

        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.nft,
          abi: NFT_ABI,
          functionName: "transferFrom",
          args: [params.actor, params.toAddress, BigInt(params.tokenId)],
        });

        setTxHash(hash);
        setTxState({ status: "pending" });
        setTxState({ status: "confirmed", txHash: hash });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setTxState({ status: "failed", error: msg });
      }
    },
    [writeContractAsync]
  );

  const reset = useCallback(() => {
    setTxState({ status: "idle" });
    setTxHash(undefined);
  }, []);

  return { transfer, txState, isConfirming, reset };
}
