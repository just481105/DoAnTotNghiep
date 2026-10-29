const AI_GATEWAY_URL = process.env.NEXT_PUBLIC_AI_GATEWAY_URL || 'http://localhost:8001/api/v1';

export async function sendAudioForEvaluation(audioBlob: Blob, targetWord: string) {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'speech.wav');
  formData.append('target_word', targetWord);

  const response = await fetch(`${AI_GATEWAY_URL}/evaluate-pronunciation`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Lỗi phân tích phát âm từ AI Speech Gateway');
  }

  return response.json();
}