# Dependency Vulnerability Audit & Pre-Demo Checklist

This checklist defines the protocol for inspecting, triaging, and remediating third-party dependency vulnerabilities across the D-Vault repository.

---

## 🚨 Mandatory Pre-Demo Procedure (T - 24 Hours)

The day prior to any hackathon presentation, stakeholder review, or production release, complete the following audit walkthrough to ensure zero unmitigated critical CVEs.

### Step 1: Run Fresh Local Audits

Execute dependency audits across both application workspaces:

```bash
# 1. Audit Backend dependencies
cd backend
npm audit --audit-level=high

# 2. Audit Frontend dependencies
cd ../frontend-web3
npm audit --audit-level=high
```

---

## Step 2: Triage Framework

Evaluate any reported vulnerabilities based on severity and exploitability in our architecture:

| Severity | Action Required | Hackathon Demo Policy |
| :--- | :--- | :--- |
| **Critical** | Immediate patch / upgrade | **Blocker**: Must be fixed or actively mitigated with documented rationale. |
| **High** | Patch if available without breaking changes | Patch if non-breaking; if breaking, verify whether vulnerable code path is reached. |
| **Moderate / Low** | Routine maintenance via Dependabot | Review during regular maintenance cycles; non-blocking for demo. |

---

## Step 3: Remediation Workflow

1. **Automatic Remediation (Safe)**:
   ```bash
   # Attempt non-breaking version bump
   npm audit fix
   ```

2. **Handle Breaking Peer-Dependency Constraints**:
   - In Web3 projects, libraries such as `@rainbow-me/rainbowkit`, `wagmi`, and `viem` have tightly-coupled peer dependencies.
   - If `npm audit fix --force` suggests downgrading core Web3 packages or breaking React 18 / Next 14 compatibility, **DO NOT run `--force` blindly**.
   - Instead, investigate if the advisory affects a server-side runtime package or an unused client bundle.

3. **Validation After Remediation**:
   Always run test and build suites after adjusting dependencies:
   ```bash
   # Backend validation
   cd backend
   npx prisma generate
   npm test
   npm run build

   # Frontend validation
   cd ../frontend-web3
   npm run lint
   npm run build
   ```

---

## Step 4: Fallback Mitigation for Unpatchable Transitive Advisories

If a critical advisory originates in an upstream transitive package with no upstream patch available:
1. Identify the package chain: `npm explain <vulnerable-package>`.
2. Determine if the vulnerable code path is callable by user input.
3. If not callable or safeguarded by API input validation (e.g. `zod` schema guards or rate limiters), document the finding below in the **Pre-Demo Sign-Off Table**.

---

## Pre-Demo Sign-Off Table

| Component | Audit Run Date | Critical Vulnerabilities | High Vulnerabilities | Mitigation / Status | Auditor Sign-Off |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `backend/` | YYYY-MM-DD | 0 | 0 | None detected / Clean | [Name] |
| `frontend-web3/` | YYYY-MM-DD | 0 | 0 | None detected / Clean | [Name] |
| `contracts/` | *(Pending)* | - | - | Pending Hardhat merge | - |
