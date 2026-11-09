import { NextResponse } from "next/server";
import { getWritingPrompts } from "@/lib/writing-prompts";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getWritingPrompts());
}
