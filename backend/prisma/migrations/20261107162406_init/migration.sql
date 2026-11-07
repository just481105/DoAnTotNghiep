-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'CONTENT_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('VSTEP', 'CEFR', 'IELTS_MOCK', 'GENERAL');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('LISTENING', 'READING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "xp_points" INTEGER NOT NULL DEFAULT 0,
    "last_studied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabularies" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "cefr_level" TEXT NOT NULL,
    "ipa" TEXT NOT NULL,
    "meaning_vi" TEXT NOT NULL,
    "meaning_en" TEXT,
    "example_en" TEXT NOT NULL,
    "example_vi" TEXT,
    "collocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audio_url" TEXT,
    "topic" TEXT NOT NULL DEFAULT 'Tổng quát',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabularies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sm2_stats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vocabulary_id" TEXT NOT NULL,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "interval_days" INTEGER NOT NULL DEFAULT 0,
    "easiness_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "next_review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_quality" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sm2_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "exam_type" "ExamType" NOT NULL DEFAULT 'VSTEP',
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "total_marks" INTEGER NOT NULL DEFAULT 100,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "skill_type" "SkillType" NOT NULL DEFAULT 'READING',
    "passage_text" TEXT,
    "audio_url" TEXT,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "option_label" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_exam_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_correct" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "user_exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_id" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speaking_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vocabulary_id" TEXT,
    "word" TEXT NOT NULL,
    "accuracy_score" DOUBLE PRECISION NOT NULL,
    "transcribed_text" TEXT,
    "phoneme_scores" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaking_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vocabularies_word_key" ON "vocabularies"("word");

-- CreateIndex
CREATE INDEX "vocabularies_topic_idx" ON "vocabularies"("topic");

-- CreateIndex
CREATE INDEX "user_sm2_stats_user_id_next_review_at_idx" ON "user_sm2_stats"("user_id", "next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_sm2_stats_user_id_vocabulary_id_key" ON "user_sm2_stats"("user_id", "vocabulary_id");

-- CreateIndex
CREATE INDEX "questions_exam_id_order_index_idx" ON "questions"("exam_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_question_id_option_label_key" ON "question_options"("question_id", "option_label");

-- CreateIndex
CREATE INDEX "user_exam_attempts_user_id_exam_id_idx" ON "user_exam_attempts"("user_id", "exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_answers_attempt_id_question_id_key" ON "user_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE INDEX "speaking_histories_user_id_idx" ON "speaking_histories"("user_id");

-- AddForeignKey
ALTER TABLE "user_sm2_stats" ADD CONSTRAINT "user_sm2_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sm2_stats" ADD CONSTRAINT "user_sm2_stats_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "user_exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "user_exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "user_exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "question_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speaking_histories" ADD CONSTRAINT "speaking_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speaking_histories" ADD CONSTRAINT "speaking_histories_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
