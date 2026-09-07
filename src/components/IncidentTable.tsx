import Link from "next/link";
import { Incident } from "@/lib/types";
import SeverityBadge from "./SeverityBadge";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IncidentTable({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-ink-muted">No incidents triaged yet.</p>
        <Link href="/" className="text-[13px] text-ink-muted hover:text-ink underline underline-offset-2 mt-2 inline-block">
          run your first triage
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line">
      <div className="grid grid-cols-[110px_90px_1fr_140px_90px] gap-4 px-6 py-2.5 text-[11px] font-mono text-ink-dim">
        <span>time</span>
        <span>severity</span>
        <span>title</span>
        <span>source</span>
        <span>confidence</span>
      </div>
      {incidents.map((incident) => (
        <Link
          key={incident.id}
          href={`/incidents/${incident.id}`}
          className="grid grid-cols-[110px_90px_1fr_140px_90px] gap-4 px-6 py-3.5 items-center hover:bg-panel-raised transition-colors"
        >
          <span className="font-mono text-[12.5px] text-ink-dim">{formatTime(incident.created_at)}</span>
          <SeverityBadge severity={incident.severity} size="sm" />
          <span className="text-sm text-ink truncate">{incident.title}</span>
          <span className="font-mono text-[12px] text-ink-muted truncate">
            {incident.source_system || "—"}
          </span>
          <span className="font-mono text-[12px] text-ink-dim">
            {Math.round(incident.confidence * 100)}%
          </span>
        </Link>
      ))}
    </div>
  );
}
