-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'MANAGER', 'AUDITOR', 'USER');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('PENDING', 'CONFIRMED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DID_CREATED', 'ROLE_ASSIGNED', 'NFT_MINTED', 'TRANSFER', 'PERMISSION_UPDATED');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "did" TEXT,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" TEXT,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "owner_address" TEXT NOT NULL,
    "owner_did" TEXT,
    "metadata_cid" TEXT NOT NULL,
    "ipfs_uri" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "asset_type" TEXT,
    "name" TEXT,
    "description" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'CONFIRMED',
    "minted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nonces" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nonces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "from_address" TEXT,
    "to_address" TEXT,
    "token_id" TEXT,
    "block_number" BIGINT,
    "status" "TxStatus" NOT NULL DEFAULT 'CONFIRMED',
    "timestamp" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_address" TEXT,
    "token_id" TEXT,
    "tx_hash" TEXT,
    "block_number" BIGINT,
    "log_index" INTEGER,
    "timestamp" TIMESTAMP(3),
    "data_json" JSONB,
    "event_identity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexer_state" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "last_block_number" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indexer_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "users_did_key" ON "users"("did");

-- CreateIndex
CREATE UNIQUE INDEX "assets_token_id_key" ON "assets"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "nonces_wallet_address_nonce_key" ON "nonces"("wallet_address", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_tx_hash_key" ON "transactions"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "audit_events_event_identity_key" ON "audit_events"("event_identity");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_owner_address_fkey" FOREIGN KEY ("owner_address") REFERENCES "users"("wallet_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "assets"("token_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_address_fkey" FOREIGN KEY ("actor_address") REFERENCES "users"("wallet_address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "assets"("token_id") ON DELETE SET NULL ON UPDATE CASCADE;
