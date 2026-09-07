import { NextRequest, NextResponse } from "next/server";
import { getIncident, deleteIncident } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = getIncident(id);
  if (!incident) {
    return NextResponse.json({ error: "Incident not found." }, { status: 404 });
  }
  return NextResponse.json(incident);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteIncident(id);
  return NextResponse.json({ ok: true });
}
