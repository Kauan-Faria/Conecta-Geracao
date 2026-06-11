-- CreateEnum
CREATE TYPE "notification_delivery_status" AS ENUM ('sent', 'skipped');

-- CreateEnum
CREATE TYPE "notification_delivery_type" AS ENUM ('reminder', 'ai_response', 'tip', 'campaign');

-- CreateTable
CREATE TABLE "notification_delivery_logs" (
    "id" TEXT NOT NULL,
    "firebase_uid" VARCHAR(128) NOT NULL,
    "conversation_id" VARCHAR(128),
    "notification_type" "notification_delivery_type" NOT NULL,
    "status" "notification_delivery_status" NOT NULL,
    "fcm_message_id" VARCHAR(256),
    "skipped_reason" VARCHAR(64),
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_delivery_logs_conversation_id_notification_typ_idx" ON "notification_delivery_logs"("conversation_id", "notification_type", "sent_at" DESC);

-- CreateIndex
CREATE INDEX "notification_delivery_logs_firebase_uid_sent_at_idx" ON "notification_delivery_logs"("firebase_uid", "sent_at" DESC);
