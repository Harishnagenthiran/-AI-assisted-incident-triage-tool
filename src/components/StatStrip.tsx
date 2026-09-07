const ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
const COLORS: Record<(typeof ORDER)[number], string> = {
  CRITICAL: "var(--sev-critical)",
  HIGH: "var(--sev-high)",
  MEDIUM: "var(--sev-medium)",
  LOW: "var(--sev-low)",
};

export default function StatStrip({
  total,
  bySeverity,
}: {
  total: number;
  bySeverity: { severity: string; count: number }[];
}) {
  const counts = Object.fromEntries(bySeverity.map((s) => [s.severity, s.count]));

  return (
    <div className="flex items-center gap-6 px-6 py-3 border-b border-line">
      <span className="text-sm text-ink font-medium">{total} total</span>
      {ORDER.map((sev) => (
        <span key={sev} className="flex items-center gap-1.5 font-mono text-[12.5px] text-ink-muted">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[sev] }} />
          {counts[sev] || 0} {sev.toLowerCase()}
        </span>
      ))}
    </div>
  );
}
