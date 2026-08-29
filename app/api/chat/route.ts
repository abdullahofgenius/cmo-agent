import { NextRequest, NextResponse } from "next/server";
import { answerTeam } from "@/lib/agent-team";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 800) : "";
    const report = body?.report;
    if (!message) return NextResponse.json({ error: "Say something to the team." }, { status: 400 });
    if (!report || typeof report !== "object") {
      return NextResponse.json({ error: "No analysis to talk about. Run a website scan first." }, { status: 400 });
    }
    const answer = await answerTeam(message, report);
    return NextResponse.json(answer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The team could not reply.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
