export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Incident {
  id: string;
  title: string;
  source_system: string | null;
  raw_log: string;
  severity: Severity;
  confidence: number;
  summary: string;
  root_cause: string;
  evidence: string[];
  resolution_steps: string[];
  similar_pattern: string | null;
  created_at: string;
}
