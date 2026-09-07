import { Severity } from "@/lib/types";

const STYLES: Record<Severity, { fg: string; bg: string; label: string }> = {
  CRITICAL: { fg: "var(--sev-critical)", bg: "var(--sev-critical-dim)", label: "Critical" },
  HIGH: { fg: "var(--sev-high)", bg: "var(--sev-high-dim)", label: "High" },
  MEDIUM: { fg: "var(--sev-medium)", bg: "var(--sev-medium-dim)", label: "Medium" },
  LOW: { fg: "var(--sev-low)", bg: "var(--sev-low-dim)", label: "Low" },
};

export default function SeverityBadge({ severity, size = "md" }: { severity: Severity; size?: "sm" | "md" }) {
  const s = STYLES[severity];
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wide ${padding}`}
      style={{ color: s.fg, background: s.bg, borderLeft: `2px solid ${s.fg}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fg }} />
      {s.label}
    </span>
  );
}
