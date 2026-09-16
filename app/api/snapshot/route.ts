import { NextResponse } from "next/server";
import { getSnapshotBundle } from "@/server/repositories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getSnapshotBundle();
  return NextResponse.json(snapshot);
}
