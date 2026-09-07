"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Incident } from "@/lib/types";
import ResultPanel from "./ResultPanel";

const SAMPLE_LOG = `2026-09-05T02:14:11Z ERROR [payments-api] PoolExhaustedException: no available connections in pool "pg-primary" (max=20, active=20, waiting=47)
2026-09-05T02:14:11Z WARN  [payments-api] request timeout after 30000ms for POST /v1/charges
2026-09-05T02:14:12Z ERROR [payments-api] PoolExhaustedException: no available connections in pool "pg-primary" (max=20, active=20, waiting=52)
2026-09-05T02:14:14Z INFO  [payments-api] circuit breaker "pg-primary" tripped to OPEN
2026-09-05T02:11:02Z INFO  [billing-worker] started batch job reconcile_invoices (rows=1_204_812)
2026-09-05T02:14:20Z ERROR [payments-api] 503 returned for 214 requests in the last 60s`;

export default function TriageWorkspace() {
  const router = useRouter();
  const [rawLog, setRawLog] = useState("");
  const [sourceSystem, setSourceSystem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Incident | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawLog.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawLog, sourceSystem: sourceSystem || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data as Incident);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-4rem)]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col border-r border-line p-6 gap-4 overflow-y-auto scroll-thin"
      >
        <div>
          <label className="text-[12px] text-ink-dim font-mono block mb-1.5">source_system (optional)</label>
          <input
            value={sourceSystem}
            onChange={(e) => setSourceSystem(e.target.value)}
            placeholder="e.g. payments-api, checkout-worker"
            className="w-full bg-panel-raised border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-[var(--sev-high)]"
          />
        </div>

        <div className="flex-1 flex flex-col min-h-[240px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] text-ink-dim font-mono">raw_log</label>
            <button
              type="button"
              onClick={() => setRawLog(SAMPLE_LOG)}
              className="text-[12px] text-ink-muted hover:text-ink underline underline-offset-2"
            >
              load sample
            </button>
          </div>
          <textarea
            value={rawLog}
            onChange={(e) => setRawLog(e.target.value)}
            placeholder="Paste a log excerpt, stack trace, or incident description..."
            className="flex-1 w-full resize-none bg-panel-raised border border-line px-3 py-2.5 text-[13px] font-mono text-ink placeholder:text-ink-dim leading-relaxed focus:outline-none focus:border-[var(--sev-high)]"
          />
        </div>

        {error && (
          <p
            className="text-[13px] px-3 py-2 leading-relaxed"
            style={{ color: "var(--sev-critical)", background: "var(--sev-critical-dim)" }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!rawLog.trim() || loading}
          className="w-full py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ background: "var(--sev-high)", color: "#10131a" }}
        >
          {loading ? "Analyzing…" : "Run triage"}
        </button>
      </form>

      <div className="p-6 overflow-hidden">
        {result ? (
          <>
            <ResultPanel incident={result} />
            <button
              onClick={() => router.push(`/incidents/${result.id}`)}
              className="mt-3 text-[12px] text-ink-muted hover:text-ink underline underline-offset-2"
            >
              view in history
            </button>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
              Paste a log on the left and run triage. Severity, root cause, and next steps show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
