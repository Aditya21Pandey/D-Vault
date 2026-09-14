# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Compile contracts and generate TypeChain types
RUN npx hardhat compile

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/hardhat.config.ts ./hardhat.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/typechain-types ./typechain-types

EXPOSE 8545

# Start a persistent Hardhat node accessible from other containers
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
