import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

// GET /api/admin/notifications — fetch all stored notifications (newest first)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // keep last 100
  });

  return NextResponse.json(notifications);
}

// PATCH /api/admin/notifications — mark all as read (or specific ids)
export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { ids } = body as { ids?: string[] };

  if (ids && ids.length > 0) {
    // Mark specific notifications as read
    await prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { read: true },
    });
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/notifications — clear all notifications
export async function DELETE() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.deleteMany({});
  return NextResponse.json({ ok: true });
}
