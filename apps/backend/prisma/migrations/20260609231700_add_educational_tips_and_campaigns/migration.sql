-- CreateEnum
CREATE TYPE "campaign_segment_type" AS ENUM ('all_active', 'uid_list');

-- CreateEnum
CREATE TYPE "campaign_status" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "educational_tips" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" TEXT NOT NULL,
    "deep_link" VARCHAR(256) NOT NULL,
    "topic_tag" VARCHAR(64),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "educational_tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" TEXT NOT NULL,
    "deep_link" VARCHAR(256) NOT NULL,
    "segment_type" "campaign_segment_type" NOT NULL,
    "segment_payload" JSONB,
    "status" "campaign_status" NOT NULL DEFAULT 'pending',
    "requested_by" VARCHAR(128) NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "idempotency_key" VARCHAR(128),

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "educational_tips_topic_tag_key" ON "educational_tips"("topic_tag");

-- CreateIndex
CREATE INDEX "educational_tips_is_active_sort_order_idx" ON "educational_tips"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "campaigns_status_requested_at_idx" ON "campaigns"("status", "requested_at" DESC);

-- CreateIndex
CREATE INDEX "campaigns_idempotency_key_requested_at_idx" ON "campaigns"("idempotency_key", "requested_at");

-- CreateIndex
CREATE INDEX "notification_delivery_logs_firebase_uid_notification_type_idx" ON "notification_delivery_logs"("firebase_uid", "notification_type", "sent_at" DESC);
