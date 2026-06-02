-- CreateTable
CREATE TABLE "knowledge_topics" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "summary" VARCHAR(500) NOT NULL,
    "keywords" TEXT[],
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_steps" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "instruction" VARCHAR(500) NOT NULL,
    "checkpoint_question" VARCHAR(300),
    "checkpoint_hints" TEXT[],

    CONSTRAINT "knowledge_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_topics_slug_key" ON "knowledge_topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_steps_topic_id_order_key" ON "knowledge_steps"("topic_id", "order");

-- AddForeignKey
ALTER TABLE "knowledge_steps" ADD CONSTRAINT "knowledge_steps_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "knowledge_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
