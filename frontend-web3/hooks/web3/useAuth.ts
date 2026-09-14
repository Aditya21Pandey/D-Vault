"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { API_URL, MOCK_MODE } from "@/config/app";
import { setAuthToken, getAuthToken, clearAuthToken } from "@/lib/web3/authStorage";

export type AuthState = "unauthenticated" | "signing" | "authenticated" | "error";

/**
 * useAuth — wallet-to-backend authentication hook.
 *
 * Flow (real mode):
 *   1. Wallet connects  →  GET /api/auth/nonce?address=...
 *   2. Backend returns a challenge message
 *   3. User signs it with their wallet (no gas, no tx)
 *   4. POST /api/auth/verify { address, signature }
 *   5. Backend returns a JWT  →  stored in localStorage
 *   6. All subsequent API calls include `Authorization: Bearer <jwt>`
 *
 * On wallet disconnect the JWT is cleared automatically.
 */
export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [authState, setAuthState] = useState<AuthState>("unauthenticated");
  const [error, setError] = useState<string | null>(null);

  // When wallet disconnects, clear auth
  useEffect(() => {
    if (!isConnected) {
      clearAuthToken();
      setAuthState("unauthenticated");
    }
  }, [isConnected]);

  // When wallet connects (and no existing token), auto-sign
  useEffect(() => {
    if (isConnected && address && !MOCK_MODE && !getAuthToken()) {
      login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  // If we already have a valid token on mount, mark as authenticated
  useEffect(() => {
    if (getAuthToken()) setAuthState("authenticated");
  }, []);

  const login = useCallback(async () => {
    if (!address) return;
    if (MOCK_MODE) {
      // In mock mode, skip the real auth — mark as authenticated immediately
      setAuthToken("mock-jwt-token");
      setAuthState("authenticated");
      return;
    }

    setAuthState("signing");
    setError(null);

    try {
      // Step 1: Get nonce / challenge message from backend
      const nonceRes = await fetch(
        `${API_URL}/api/auth/nonce?address=${address}`
      );
      if (!nonceRes.ok) {
        throw new Error("Failed to get login challenge from backend");
      }
      const { message } = (await nonceRes.json()) as { nonce: string; message: string };

      // Step 2: Ask wallet to sign the message (no gas required)
      const signature = await signMessageAsync({ message });

      // Step 3: Send signature to backend → receive JWT
      const verifyRes = await fetch(`${API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, signature }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error(err.message ?? "Authentication failed");
      }

      const { token } = (await verifyRes.json()) as { token: string };
      setAuthToken(token);
      setAuthState("authenticated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error";
      // If user rejected the signature request, don't show an error
      if (msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied")) {
        setAuthState("unauthenticated");
        return;
      }
      setError(msg);
      setAuthState("error");
    }
  }, [address, signMessageAsync]);

  const logout = useCallback(() => {
    clearAuthToken();
    setAuthState("unauthenticated");
    disconnect();
  }, [disconnect]);

  const isAuthenticated = authState === "authenticated";
  const isSigning = authState === "signing";

  return { authState, isAuthenticated, isSigning, error, login, logout };
}
