const CORE_API_URL = (
  process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:5001'
)
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/+$/, '');

export async function fetchWithAuth<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${CORE_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    window.dispatchEvent(new Event('auth:expired'));
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi khi gọi API Core Engine');
  }

  return response.json() as Promise<T>;
}