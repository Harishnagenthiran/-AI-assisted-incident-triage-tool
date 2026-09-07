import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "rootline.json");

export interface IncidentRecord {
  id: string;
  title: string;
  source_system: string | null;
  raw_log: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
  summary: string;
  root_cause: string;
  evidence: string[];
  resolution_steps: string[];
  similar_pattern: string | null;
  created_at: string;
}

function ensureStore(): IncidentRecord[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or empty file — reset rather than crash the app.
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    return [];
  }
}

function writeStore(records: IncidentRecord[]) {
  // Write to a temp file then rename, so a crash mid-write can't corrupt the store.
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(records, null, 2), "utf-8");
  fs.renameSync(tmp, DATA_FILE);
}

export function insertIncident(record: IncidentRecord) {
  const records = ensureStore();
  records.unshift(record);
  writeStore(records);
}

export function listIncidents(): IncidentRecord[] {
  return ensureStore().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getIncident(id: string): IncidentRecord | null {
  return ensureStore().find((r) => r.id === id) ?? null;
}

export function deleteIncident(id: string) {
  const records = ensureStore().filter((r) => r.id !== id);
  writeStore(records);
}

export function stats() {
  const records = ensureStore();
  const counts = new Map<string, number>();
  for (const r of records) counts.set(r.severity, (counts.get(r.severity) || 0) + 1);
  const bySeverity = Array.from(counts.entries()).map(([severity, count]) => ({
    severity,
    count,
  }));
  return { total: records.length, bySeverity };
}
