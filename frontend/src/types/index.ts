export interface Vocabulary {
  id: string;
  word: string;
  pos: string;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  ipa: string;
  meaning_vi: string;
  meaning_en: string;
  example_en: string;
  example_vi?: string;
  audio_us_url?: string;
  audio_uk_url?: string;
}

export type SM2Rating = 0 | 1 | 2 | 3 | 4 | 5;

export interface UserSM2Stats {
  id: string;
  user_id: string;
  word_id: string;
  repetitions: number;
  interval_days: number;
  easiness_factor: number;
  next_review_at: string;
  last_quality?: SM2Rating;
}

export interface PhonemeEvaluation {
  phoneme: string;
  is_correct: boolean;
  score: number;
}

export interface SpeechEvaluationResult {
  word: string;
  expected_ipa: string;
  transcribed_text: string;
  accuracy_score: number;
  phonemes: PhonemeEvaluation[];
}