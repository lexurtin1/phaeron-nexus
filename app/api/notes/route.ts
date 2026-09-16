import { NextResponse } from "next/server";
import { createNote, listNotes } from "@/server/repositories";
import type { Note } from "@/data/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const objectId = url.searchParams.get("objectId") ?? undefined;
  const notes = await listNotes(objectId);
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Omit<Note, "id" | "createdAt">;
  if (!body.body || !body.objectId || !body.objectType || !body.author) {
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  }
  const note = await createNote(body);
  return NextResponse.json({ note }, { status: 201 });
}
