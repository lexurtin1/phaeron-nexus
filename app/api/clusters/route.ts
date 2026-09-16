import { NextResponse } from "next/server";
import { getCluster, listClusters } from "@/server/repositories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    const cluster = await getCluster(id);
    if (!cluster) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ cluster });
  }
  const clusters = await listClusters();
  return NextResponse.json({ clusters });
}
