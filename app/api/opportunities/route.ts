import { NextResponse } from "next/server";
import { listOpportunities } from "@/server/repositories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const opportunities = await listOpportunities();
  return NextResponse.json({ opportunities });
}
