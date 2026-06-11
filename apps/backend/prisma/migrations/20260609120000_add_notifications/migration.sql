-- CreateEnum
CREATE TYPE "device_platform" AS ENUM ('ios', 'android');

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "firebase_uid" VARCHAR(128) NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "platform" "device_platform" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "firebase_uid" VARCHAR(128) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("firebase_uid")
);

-- CreateIndex
CREATE INDEX "device_tokens_firebase_uid_is_active_idx" ON "device_tokens"("firebase_uid", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_firebase_uid_token_key" ON "device_tokens"("firebase_uid", "token");
