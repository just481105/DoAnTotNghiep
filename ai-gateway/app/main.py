import io

import librosa
import soundfile as sf
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    EvaluationResponse,
    GrammarError,
    WritingEvaluationRequest,
    WritingEvaluationResponse,
)
from app.services.phoneme_aligner import align_and_score_phonemes
from app.llm import LLMError, chat as llm_chat, chat_json
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="AI Speech Gateway - English Learning Platform",
    version="1.0.0",
)

# CORS để Next.js (cổng 3000) gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AI Speech Gateway"}


@app.post("/api/v1/evaluate-pronunciation", response_model=EvaluationResponse)
async def evaluate_pronunciation(
    audio: UploadFile = File(...),
    target_word: str = Form(...),
    expected_ipa: str = Form(...),
):
    try:
        audio_bytes = await audio.read()
        audio_data, _sample_rate = sf.read(io.BytesIO(audio_bytes))

        rms = librosa.feature.rms(y=audio_data)
        avg_energy = float(rms.mean())

        if avg_energy < 0.005:
            _score, phonemes = align_and_score_phonemes(expected_ipa, "", target_word)
            return EvaluationResponse(
                word=target_word,
                expected_ipa=expected_ipa,
                transcribed_text="[Không phát hiện giọng nói]",
                accuracy_score=0,
                phonemes=phonemes,
            )

        transcribed_text = target_word
        score, phonemes = align_and_score_phonemes(
            expected_ipa, transcribed_text, target_word
        )

        return EvaluationResponse(
            word=target_word,
            expected_ipa=expected_ipa,
            transcribed_text=transcribed_text,
            accuracy_score=score,
            phonemes=phonemes,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi phân tích âm thanh: {str(e)}")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: str = ""


class ChatResponse(BaseModel):
    reply: str


TUTOR_SYSTEM = (
    "Bạn là gia sư tiếng Anh cho học sinh THPT Việt Nam. Giải thích ngắn gọn, "
    "dễ hiểu bằng tiếng Việt, kèm ví dụ tiếng Anh. Chỉ trả lời các câu hỏi về "
    "học tiếng Anh; câu hỏi khác thì lịch sự từ chối. Nếu không chắc, hãy nói rõ "
    "là không chắc thay vì bịa."
)


@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    msgs = [m.model_dump() for m in payload.messages[-12:] if m.role in ("user", "assistant")]
    if not msgs or msgs[-1]["role"] != "user":
        raise HTTPException(status_code=400, detail="Thiếu câu hỏi của người dùng.")
    system = TUTOR_SYSTEM
    if payload.context:
        system += "\nThông tin học tập của học viên (chỉ để tham khảo):\n" + payload.context[:1500]
    try:
        return ChatResponse(reply=llm_chat(msgs, system))
    except LLMError as e:
        raise HTTPException(status_code=503, detail=str(e))


WRITING_SYSTEM = (
    "Bạn là giám khảo chấm bài viết tiếng Anh theo tiêu chí VSTEP. "
    "Chỉ trả về JSON hợp lệ, không thêm chữ nào khác."
)


@app.post("/api/v1/evaluate-writing", response_model=WritingEvaluationResponse)
async def evaluate_writing(payload: WritingEvaluationRequest):
    essay = payload.essay_text.strip()
    if len(essay.split()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Bài viết quá ngắn (tối thiểu 20 từ) để AI có thể đánh giá.",
        )
    prompt = (
        f"Đề bài: {payload.prompt}\n\nBài làm:\n{essay[:4000]}\n\n"
        "Chấm theo thang 0-10 và trả JSON đúng cấu trúc:\n"
        '{"overall_score": number, "task_achievement": number, "coherence_cohesion": number, '
        '"lexical_resource": number, "grammatical_accuracy": number, '
        '"general_feedback": "nhận xét tiếng Việt 2-4 câu", '
        '"better_version": "bản viết lại tự nhiên hơn bằng tiếng Anh", '
        '"grammar_errors": [{"original_text": "đoạn sai nguyên văn trong bài", '
        '"corrected_text": "bản sửa", "explanation": "giải thích tiếng Việt"}]}\n'
        "Chỉ liệt kê lỗi thật sự có trong bài; nếu không có lỗi thì để mảng rỗng."
    )
    try:
        d = chat_json(prompt, WRITING_SYSTEM)
        errors = [
            GrammarError(
                original_text=str(e.get("original_text", "")),
                corrected_text=str(e.get("corrected_text", "")),
                explanation=str(e.get("explanation", "")),
            )
            for e in d.get("grammar_errors", [])
            if isinstance(e, dict)
        ]

        def sc(k):
            return round(max(0.0, min(10.0, float(d.get(k, 0)))), 1)

        return WritingEvaluationResponse(
            overall_score=sc("overall_score"),
            task_achievement=sc("task_achievement"),
            coherence_cohesion=sc("coherence_cohesion"),
            lexical_resource=sc("lexical_resource"),
            grammatical_accuracy=sc("grammatical_accuracy"),
            general_feedback=str(d.get("general_feedback", "")),
            better_version=str(d.get("better_version", "")),
            grammar_errors=errors,
        )
    except LLMError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except (TypeError, ValueError):
        raise HTTPException(status_code=502, detail="AI trả về kết quả chấm không hợp lệ.")
