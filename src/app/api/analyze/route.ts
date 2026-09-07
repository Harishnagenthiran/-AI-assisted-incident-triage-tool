import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { analyzeLog } from "@/lib/analyze";
import { insertIncident } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { rawLog?: string; sourceSystem?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawLog = (body.rawLog || "").trim();
  if (!rawLog) {
    return NextResponse.json({ error: "rawLog is required." }, { status: 400 });
  }
  if (rawLog.length > 20000) {
    return NextResponse.json(
      { error: "Log is too long. Trim it to the relevant excerpt (max 20,000 characters)." },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeLog(rawLog, { sourceSystem: body.sourceSystem });

    const record = {
      id: randomUUID(),
      title: result.title,
      source_system: body.sourceSystem || null,
      raw_log: rawLog,
      severity: result.severity,
      confidence: result.confidence,
      summary: result.summary,
      root_cause: result.root_cause,
      evidence: result.evidence,
      resolution_steps: result.resolution_steps,
      similar_pattern: result.similar_pattern,
      created_at: new Date().toISOString(),
    };

    insertIncident(record);

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    const status = message.includes("GEMINI_API_KEY") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
