import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/analyzer";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!url || url.length > 500) {
      return NextResponse.json({ error: "Enter a valid website URL." }, { status: 400 });
    }
    const report = await analyzeWebsite(url);
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The analysis could not be completed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
