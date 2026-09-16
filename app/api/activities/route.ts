import { NextResponse } from "next/server";
import { listActivities } from "@/server/repositories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const activities = await listActivities(limit);
  return NextResponse.json({ activities });
}
