"use client";

import { useCallback, useEffect, useState } from "react";
import type { NFTAsset } from "@/types";
import { mockStore } from "@/mock/store";
import { MOCK_MODE, API_URL } from "@/config/app";
import { getAuthToken } from "@/lib/web3/authStorage";

interface ApiAsset {
  tokenId: string;
  ownerAddress: string;
  ownerDID: string | null;
  metadataCID: string;
  ipfsUri: string;
  name: string | null;
  description: string | null;
  assetType: string | null;
  status: string;
  mintedAt: string | null;
}

function mapApiAsset(a: ApiAsset): NFTAsset {
  return {
    tokenId: a.tokenId,
    ownerAddress: a.ownerAddress as `0x${string}`,
    ownerDid: a.ownerDID ?? "",
    metadataUri: a.ipfsUri,
    name: a.name ?? `Asset #${a.tokenId}`,
    description: a.description ?? "",
    mintTx: a.metadataCID,
    mintedAt: a.mintedAt ? new Date(a.mintedAt).getTime() : Date.now(),
  } as unknown as NFTAsset;
}

/**
 * Fetch the assets owned by a given wallet address.
 * Real mode: calls GET /api/assets?ownerAddress=... on the backend.
 * The backend reads from PostgreSQL (indexed from NFTMinted events).
 */
export function useUserAssets(address: `0x${string}` | null | undefined): {
  assets: NFTAsset[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [assets, setAssets] = useState<NFTAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!address) { setAssets([]); return; }
    if (MOCK_MODE) { setAssets(mockStore.listAssetsForOwner(address)); return; }

    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_URL}/api/assets?ownerAddress=${address}&limit=100`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rawAssets: ApiAsset[] = json.assets ?? json.data ?? json ?? [];
      setAssets(rawAssets.map(mapApiAsset));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assets");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  return { assets, isLoading, error, refetch: fetchAssets };
}

/**
 * Fetch all confirmed assets (for admin / auditor views).
 */
export function useAllAssets(): {
  assets: NFTAsset[];
  isLoading: boolean;
  refetch: () => void;
} {
  const [assets, setAssets] = useState<NFTAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (MOCK_MODE) { setAssets(mockStore.listAllAssets()); return; }
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/assets?limit=200`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rawAssets: ApiAsset[] = json.assets ?? json.data ?? json ?? [];
      setAssets(rawAssets.map(mapApiAsset));
    } catch {
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { assets, isLoading, refetch: fetchAll };
}

/**
 * Fetch a single asset by tokenId.
 */
export function useAsset(tokenId: string | null | undefined): {
  asset: NFTAsset | null;
  isLoading: boolean;
} {
  const [asset, setAsset] = useState<NFTAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tokenId) { setAsset(null); return; }
    if (MOCK_MODE) { setAsset(mockStore.getAsset(tokenId)); return; }
    setIsLoading(true);
    const token = getAuthToken();
    fetch(`${API_URL}/api/assets/${tokenId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((json) => setAsset(mapApiAsset(json)))
      .catch(() => setAsset(null))
      .finally(() => setIsLoading(false));
  }, [tokenId]);

  return { asset, isLoading };
}
