import SeverityBadge from "./SeverityBadge";
import ConfidenceMeter from "./ConfidenceMeter";
import { Incident } from "@/lib/types";

export default function ResultPanel({ incident }: { incident: Incident }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
        <div className="min-w-0">
          <h2 className="text-[15px] font-medium text-ink leading-snug">{incident.title}</h2>
          <div className="mt-2 flex items-center gap-3">
            <SeverityBadge severity={incident.severity} />
            <ConfidenceMeter value={incident.confidence} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin py-5 flex flex-col gap-6">
        <Section label="summary">
          <p className="text-sm text-ink leading-relaxed">{incident.summary}</p>
        </Section>

        <Section label="root_cause">
          <p className="text-sm text-ink leading-relaxed">{incident.root_cause}</p>
        </Section>

        {incident.evidence.length > 0 && (
          <Section label="evidence">
            <ul className="flex flex-col gap-1.5">
              {incident.evidence.map((item, i) => (
                <li
                  key={i}
                  className="font-mono text-[12.5px] text-ink-muted pl-3 leading-relaxed"
                  style={{ borderLeft: "2px solid var(--wire)" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section label="resolution_steps">
          <ol className="flex flex-col gap-2">
            {incident.resolution_steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink leading-relaxed">
                <span className="font-mono text-ink-dim shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        {incident.similar_pattern && (
          <Section label="pattern_match">
            <p className="text-sm text-ink-muted italic">{incident.similar_pattern}</p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] text-ink-dim font-mono mb-2">{label}</p>
      {children}
    </div>
  );
}
