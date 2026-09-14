# ── Stage 1: Install & Build ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install pnpm (the new frontend uses pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ── Stage 2: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
