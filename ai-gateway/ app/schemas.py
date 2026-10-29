from pydantic import BaseModel
from typing import List

class PhonemeScore(BaseModel):
    phoneme: str
    is_correct: bool
    score: int

class EvaluationResponse(BaseModel):
    word: str
    expected_ipa: str
    transcribed_text: str
    accuracy_score: int
    phonemes: List[PhonemeScore]
# --- Bổ sung DTO cho Writing Mentor ---
class GrammarError(BaseModel):
    original_text: str
    corrected_text: str
    explanation: str

class WritingEvaluationRequest(BaseModel):
    prompt: str
    essay_text: str
    task_type: str = "VSTEP_TASK_2" # VSTEP_TASK_1 hoặc VSTEP_TASK_2

class WritingEvaluationResponse(BaseModel):
    overall_score: float # Thang 10 (chuẩn VSTEP)
    task_achievement: float
    coherence_cohesion: float
    lexical_resource: float
    grammatical_accuracy: float
    general_feedback: str
    better_version: str
    grammar_errors: List[GrammarError]
