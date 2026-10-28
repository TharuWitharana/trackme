import { NextResponse } from "next/server";
import { deleteEntry, saveEntry } from "@/lib/store";
import { isValidDate, sanitizeEntry } from "@/lib/types";

export async function PUT(request: Request, ctx: RouteContext<"/api/entries/[date]">) {
  const { date } = await ctx.params;
  if (!isValidDate(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const entry = sanitizeEntry(date, body);
  await saveEntry(entry);
  return NextResponse.json(entry);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/entries/[date]">) {
  const { date } = await ctx.params;
  if (!isValidDate(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  await deleteEntry(date);
  return new NextResponse(null, { status: 204 });
}
