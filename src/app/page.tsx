import TopBar from "@/components/TopBar";
import TriageWorkspace from "@/components/TriageWorkspace";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="New triage"
        subtitle="Paste a log excerpt or stack trace to classify severity and draft a root cause"
      />
      <TriageWorkspace />
    </div>
  );
}
