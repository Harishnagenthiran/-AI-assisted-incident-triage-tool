import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import ResultPanel from "@/components/ResultPanel";
import DeleteButton from "@/components/DeleteButton";
import { getIncident } from "@/lib/db";
import { Incident } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = getIncident(id) as Incident | null;
  if (!incident) notFound();

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Incident detail" subtitle={new Date(incident.created_at).toLocaleString()} />
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0">
        <div className="border-r border-line p-6 flex flex-col min-h-0">
          <p className="text-[12px] text-ink-dim font-mono mb-2">
            raw_log{incident.source_system ? ` · ${incident.source_system}` : ""}
          </p>
          <pre className="flex-1 overflow-auto scroll-thin bg-panel-raised border border-line p-4 text-[12.5px] font-mono text-ink-muted leading-relaxed whitespace-pre-wrap">
            {incident.raw_log}
          </pre>
          <div className="mt-4">
            <DeleteButton id={incident.id} />
          </div>
        </div>
        <div className="p-6 min-h-0 overflow-hidden">
          <ResultPanel incident={incident} />
        </div>
      </div>
    </div>
  );
}
