import TopBar from "@/components/TopBar";
import StatStrip from "@/components/StatStrip";
import IncidentTable from "@/components/IncidentTable";
import { listIncidents, stats } from "@/lib/db";
import { Incident } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
  const incidents = listIncidents() as Incident[];
  const s = stats();

  return (
    <div className="flex flex-col h-full">
      <TopBar title="History" subtitle="Every incident triaged on this instance" />
      <StatStrip total={s.total} bySeverity={s.bySeverity} />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}
