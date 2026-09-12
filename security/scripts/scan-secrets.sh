#!/usr/bin/env bash
set -e

# Resolve repository root
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

echo "=========================================================="
echo " Running Gitleaks Secret Scanner"
echo " Target directory: ${REPO_ROOT}"
echo " Configuration: security/scripts/gitleaks-config.toml"
echo "=========================================================="

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "[-] Error: 'gitleaks' executable not found in PATH." >&2
  echo "" >&2
  echo "Please install gitleaks before running secret scans:" >&2
  echo "  - macOS:   brew install gitleaks" >&2
  echo "  - Windows: winget install Gitleaks.Gitleaks  (or choco install gitleaks)" >&2
  echo "  - Linux:   curl -sSfL https://github.com/gitleaks/gitleaks/releases/latest | tar xz" >&2
  echo "  - Docker:  docker run -v \"${PWD}:/path\" zricethezav/gitleaks:latest detect --source=/path -v" >&2
  exit 1
fi

gitleaks detect --config security/scripts/gitleaks-config.toml --source . --verbose

EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "[+] Success: No leaked secrets detected across the repository."
else
  echo "[-] Security Alert: Potential secrets discovered. Please remediate immediately." >&2
fi

exit $EXIT_CODE
