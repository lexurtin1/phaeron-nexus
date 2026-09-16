import { NextResponse } from "next/server";
import { listTasks, updateTask } from "@/server/repositories";
import type { Task } from "@/data/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const tasks = await listTasks();
  return NextResponse.json({ tasks });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    id: string;
    status?: Task["status"];
    assigneeId?: string;
    assigneeName?: string;
  };
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const task = await updateTask(body.id, {
    status: body.status,
    assigneeId: body.assigneeId,
    assigneeName: body.assigneeName,
  });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ task });
}
