import { NextResponse } from "next/server";
import { getOrganisation, listOrganisations } from "@/server/repositories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const organisations = await listOrganisations();
  return NextResponse.json({ organisations });
}
