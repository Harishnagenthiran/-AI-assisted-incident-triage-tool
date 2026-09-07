"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    await fetch(`/api/incidents/${id}`, { method: "DELETE" });
    router.push("/history");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 text-[13px]">
        <span className="text-ink-muted">Delete this incident permanently?</span>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="underline underline-offset-2"
          style={{ color: "var(--sev-critical)" }}
        >
          {busy ? "deleting…" : "confirm"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-ink-dim underline underline-offset-2">
          cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[13px] text-ink-dim hover:text-ink underline underline-offset-2"
    >
      delete incident
    </button>
  );
}
