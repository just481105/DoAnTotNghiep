import { NextResponse } from "next/server";
import { searchDictionary } from "@/lib/dictionary";

export const dynamic = "force-dynamic";

// GET /api/vocabulary/search?q=com&limit=20
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 60);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "30", 10) || 30, 1),
    50,
  );
  return NextResponse.json(searchDictionary(q, limit));
}
