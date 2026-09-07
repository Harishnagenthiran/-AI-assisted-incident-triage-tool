import { NextResponse } from "next/server";
import { listIncidents, stats } from "@/lib/db";

export async function GET() {
  const incidents = listIncidents();
  return NextResponse.json({ incidents, stats: stats() });
}
