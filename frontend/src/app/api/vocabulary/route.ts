import { NextResponse } from "next/server";
import { getAllVocabulary } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";

// Trang chủ (client component) lấy danh sách bài từ vựng từ đây
export async function GET() {
  return NextResponse.json(await getAllVocabulary());
}
