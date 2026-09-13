# Security Audit Report

## 1. Overview
This report documents the security posture of the SIH project, detailing the automated scanning tools integrated into the CI/CD pipeline, the findings they generated, and the disposition of those findings (fixed, accepted risk, or mitigated).

## 2. Security Tooling
We have configured a fully automated security scanning pipeline using free, industry-standard tools:

- **Gitleaks**: Scans for hardcoded secrets and API keys on every push.
- **ESLint Security Plugin**: Enforces safe coding practices and prevents common vulnerabilities.
- **CodeQL (GitHub Advanced Security)**: Performs deep static application security testing (SAST) to find logical flaws and injection vulnerabilities.
- **Dependabot**: Automatically monitors and opens PRs for vulnerable dependencies.
- **Helmet**: Secures the backend API with robust HTTP security headers.
- **Express-Rate-Limit**: Prevents brute-force and Denial of Service (DoS) attacks on the backend.
- **npm audit**: Checks the dependency tree for known vulnerabilities.

## 3. Findings & Dispositions

### 3.1 Backend Vulnerabilities
- **Express qs**: Fixed moderate severity DoS vulnerabilities via `npm audit fix`.
- **UUID Package**: `npm audit` reports a moderate vulnerability in `uuid@<11.1.1`.
  - **Disposition**: **Accepted Risk**. Fixing this requires a major version bump (`uuid@14`) which introduces breaking changes. We will schedule a refactor to accommodate the breaking changes post-SIH demo.

### 3.2 Frontend Vulnerabilities
- **Next.js & Wagmi**: `npm audit` reported several high/critical vulnerabilities primarily within `next` and the `wagmi` / WalletConnect ecosystem.
  - **Disposition**: **Accepted Risk / Pending Validation**. The safe fixes have been applied via `npm audit fix`. The remaining vulnerabilities require breaking updates (e.g., `wagmi@3.7.7`). Since this is a prototype environment and the frontend is not processing real financial transactions, we are accepting this risk to maintain stability for the demo. An issue has been logged to investigate the upgrade path for wagmi v3.

## 4. Authentication & Authorization Design
Our platform implements a highly secure, web3-native authentication architecture:

- **Sign-In With Ethereum (SIWE)**: Authentication is completely passwordless, relying on cryptographic signatures from the user's wallet.
- **Nonce Replay Protection**: Every login attempt requires a unique, server-generated nonce that is tied to the user's IP and expires after a set TTL. This prevents replay attacks.
- **Role-Based Access Control (RBAC)**: Authorization is enforced strictly on the server side using the `requireRole` middleware. The UI also implements a `PermissionGate` for a better user experience, but the true source of truth remains the backend.
- **Secure JWTs**: After successful SIWE verification, the backend issues a JSON Web Token (JWT). The secret is enforced to be a minimum length by Zod validation at startup.

## 5. Conclusion
The D-Vault project demonstrates a robust security-first approach, employing layered defenses spanning from automated CI/CD checks to cryptographic web3 authentication.
