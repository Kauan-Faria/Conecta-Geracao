-- AlterTable
ALTER TABLE "knowledge_topics" ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
