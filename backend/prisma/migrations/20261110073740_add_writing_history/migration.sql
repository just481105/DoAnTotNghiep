-- CreateTable
CREATE TABLE "writing_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "essay_text" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "task_achievement" DOUBLE PRECISION NOT NULL,
    "coherence_cohesion" DOUBLE PRECISION NOT NULL,
    "lexical_resource" DOUBLE PRECISION NOT NULL,
    "grammatical_accuracy" DOUBLE PRECISION NOT NULL,
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "writing_histories_user_id_created_at_idx" ON "writing_histories"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "writing_histories" ADD CONSTRAINT "writing_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
