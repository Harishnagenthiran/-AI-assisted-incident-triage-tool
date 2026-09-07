export default function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-panel-raised overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${pct}%`, background: "var(--ink-muted)" }}
        />
      </div>
      <span className="font-mono text-[11px] text-ink-dim">{pct}% confidence</span>
    </div>
  );
}
