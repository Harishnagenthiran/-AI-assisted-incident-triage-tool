"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "New triage" },
  { href: "/history", label: "History" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[208px] shrink-0 border-r border-line flex flex-col bg-panel">
      <div className="h-16 flex items-center px-5 border-b border-line">
        <span className="font-mono text-[15px] tracking-tight text-ink">
          root<span style={{ color: "var(--sev-high)" }}>line</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm rounded-sm transition-colors"
              style={{
                color: active ? "var(--ink)" : "var(--ink-muted)",
                background: active ? "var(--panel-raised)" : "transparent",
                borderLeft: active ? "2px solid var(--sev-high)" : "2px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-line text-[11px] leading-relaxed text-ink-dim font-mono">
        local instance
        <br />
        no data leaves this server
      </div>
    </aside>
  );
}
