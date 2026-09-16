import { NextResponse } from "next/server";
import { getSnapshotBundle } from "@/server/repositories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  try {
    const snapshot = await getSnapshotBundle();
    return NextResponse.json(snapshot);
  } catch (err) {
    console.error("[api/snapshot]", err);
    return NextResponse.json(
      {
        error: "Failed to boot Nexus runtime",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
