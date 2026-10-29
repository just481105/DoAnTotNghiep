from typing import List, Tuple
import difflib
from app.schemas import PhonemeScore

def clean_ipa(ipa_str: str) -> List[str]:
    cleaned = ipa_str.replace("/", "").replace("ˈ", "").replace("ˌ", "").replace(".", "").strip()
    return list(cleaned)

def align_and_score_phonemes(target_ipa: str, transcribed_text: str, target_word: str) -> Tuple[int, List[PhonemeScore]]:
    target_phonemes = clean_ipa(target_ipa)
    spoken = transcribed_text.lower().strip()
    target = target_word.lower().strip()

    if not spoken:
        return 0, [PhonemeScore(phoneme=p, is_correct=False, score=0) for p in target_phonemes]

    similarity = difflib.SequenceMatcher(None, target, spoken).ratio()
    overall_score = int(similarity * 100)

    phoneme_results: List[PhonemeScore] = []
    if overall_score >= 90:
        for p in target_phonemes:
            phoneme_results.append(PhonemeScore(phoneme=p, is_correct=True, score=95))
    elif overall_score >= 60:
        for i, p in enumerate(target_phonemes):
            is_last = (i == len(target_phonemes) - 1)
            phoneme_results.append(PhonemeScore(
                phoneme=p,
                is_correct=not is_last,
                score=40 if is_last else 85
            ))
    else:
        for i, p in enumerate(target_phonemes):
            is_first = (i == 0)
            phoneme_results.append(PhonemeScore(
                phoneme=p,
                is_correct=is_first,
                score=70 if is_first else 20
            ))

    return overall_score, phoneme_results
