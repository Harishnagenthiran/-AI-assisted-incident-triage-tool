export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="h-16 flex items-center px-6 border-b border-line">
      <div>
        <h1 className="text-[15px] font-medium text-ink leading-none">{title}</h1>
        {subtitle && <p className="text-[12.5px] text-ink-dim mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
