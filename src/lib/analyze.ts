import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are an SRE incident triage assistant embedded in an on-call engineer's workflow.
You will be given a raw log excerpt, stack trace, or incident description pasted directly from a
production system. Your job is to do the first-pass root cause analysis an on-call engineer would
do manually: classify severity, explain what most likely happened, cite the specific evidence in
the log that supports your read, and propose concrete next steps.

Be precise and grounded in the text you were given. Do not invent service names, error codes, or
line numbers that are not present in the input. If the log is ambiguous or lacks enough detail to
be confident, say so plainly in your summary and lower your confidence score rather than guessing.

Respond with ONLY a single JSON object, no prose before or after it, no markdown fences, matching
exactly this shape:

{
  "title": "short (max 8 words) incident title suitable for a ticket subject line",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "confidence": number between 0 and 1,
  "summary": "2-3 sentence plain-language summary of what is happening and its likely impact",
  "root_cause": "your best-effort root cause hypothesis, 2-4 sentences, written the way an engineer would write it in a postmortem draft",
  "evidence": ["short quoted or paraphrased fragments from the log that support the diagnosis, 2-5 items"],
  "resolution_steps": ["concrete, ordered next actions for the on-call engineer, 3-6 items, starting with immediate mitigation and ending with follow-up/prevention"],
  "similar_pattern": "one sentence naming the general class of failure this resembles (e.g. 'connection pool exhaustion under load'), or null if nothing recognizable"
}

Severity guide:
- CRITICAL: active customer-facing outage, data loss risk, or security breach
- HIGH: significant degradation, a core path failing, or an outage that is contained but urgent
- MEDIUM: partial degradation, elevated error rates, or a failure with a working fallback
- LOW: cosmetic, isolated, or already self-recovered issues`;

export interface AnalysisResult {
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
  summary: string;
  root_cause: string;
  evidence: string[];
  resolution_steps: string[];
  similar_pattern: string | null;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text;
}

function coerceResult(raw: unknown): AnalysisResult {
  const r = raw as Partial<AnalysisResult> & Record<string, unknown>;
  const severity = String(r.severity || "MEDIUM").toUpperCase();
  const validSeverity = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(severity)
    ? (severity as AnalysisResult["severity"])
    : "MEDIUM";

  return {
    title: typeof r.title === "string" && r.title.trim() ? r.title.trim() : "Untitled incident",
    severity: validSeverity,
    confidence:
      typeof r.confidence === "number" && r.confidence >= 0 && r.confidence <= 1
        ? r.confidence
        : 0.5,
    summary: typeof r.summary === "string" ? r.summary : "",
    root_cause: typeof r.root_cause === "string" ? r.root_cause : "",
    evidence: Array.isArray(r.evidence) ? r.evidence.map(String) : [],
    resolution_steps: Array.isArray(r.resolution_steps)
      ? r.resolution_steps.map(String)
      : [],
    similar_pattern:
      typeof r.similar_pattern === "string" && r.similar_pattern.toLowerCase() !== "null"
        ? r.similar_pattern
        : null,
  };
}

export async function analyzeLog(
  rawLog: string,
  context?: { sourceSystem?: string }
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local (see README) before running an analysis."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const userContent = context?.sourceSystem
    ? `Source system: ${context.sourceSystem}\n\nLog:\n${rawLog}`
    : `Log:\n${rawLog}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userContent,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Model returned no text content.");
  }

  const jsonStr = extractJson(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Model response was not valid JSON.");
  }

  return coerceResult(parsed);
}
