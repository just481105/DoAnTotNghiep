/** URL backend NestJS, bỏ dấu / và hậu tố /api/v1 nếu có. */
export const CORE_API_URL = (
  process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:5001"
)
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "");
