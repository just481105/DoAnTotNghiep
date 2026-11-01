import { NextResponse } from "next/server";
import { getAllLessons } from "@/lib/grammar";

export const dynamic = "force-dynamic";

// Trang chủ (client component) lấy danh sách bài ngữ pháp từ đây
export async function GET() {
  return NextResponse.json(await getAllLessons());
}
