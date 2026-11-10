import json
import os
import re
import time
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

BASE = "https://generativelanguage.googleapis.com/v1beta/models"
RETRY_STATUS = {429, 500, 502, 503, 504}


class LLMError(Exception):
    """Lỗi gọi LLM, message đã thân thiện để trả cho người dùng."""


def _call(payload: dict, timeout: float = 60.0) -> str:
    key = os.environ.get("LLM_API_KEY")
    model = os.environ.get("LLM_MODEL", "gemini-flash-lite-latest")
    if not key:
        raise LLMError("Chưa cấu hình LLM_API_KEY cho AI gateway.")

    last = "không rõ"
    for attempt in range(3):
        try:
            r = httpx.post(
                f"{BASE}/{model}:generateContent",
                headers={"x-goog-api-key": key},
                json=payload,
                timeout=httpx.Timeout(timeout, connect=10.0),
            )
        except httpx.TimeoutException:
            last = "timeout"
        except httpx.HTTPError as e:
            last = type(e).__name__
        else:
            if r.status_code == 200:
                try:
                    return r.json()["candidates"][0]["content"]["parts"][0]["text"]
                except (KeyError, IndexError, ValueError):
                    raise LLMError("AI trả về nội dung không đọc được.")
            last = str(r.status_code)
            if r.status_code not in RETRY_STATUS:
                raise LLMError(f"AI từ chối yêu cầu (mã {r.status_code}).")
        time.sleep(1.5 * (attempt + 1))
    raise LLMError(f"AI đang bận, vui lòng thử lại sau ít giây ({last}).")


def chat(messages: list, system: Optional[str] = None) -> str:
    """messages: [{"role": "user"|"assistant", "content": str}]"""
    contents = [
        {
            "role": "user" if m["role"] == "user" else "model",
            "parts": [{"text": m["content"]}],
        }
        for m in messages
    ]
    payload: dict = {
        "contents": contents,
        "generationConfig": {"maxOutputTokens": 800, "temperature": 0.4},
    }
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
    return _call(payload)


def chat_json(prompt: str, system: Optional[str] = None) -> dict:
    """Yêu cầu LLM trả JSON thuần, tự gỡ rào ``` nếu có."""
    payload: dict = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 2000,
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
    text = _call(payload, timeout=90.0).strip()
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.M).strip()
    try:
        return json.loads(text)
    except ValueError:
        raise LLMError("AI trả về dữ liệu sai định dạng, thử lại.")
