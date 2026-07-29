import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { emitSSEEvent } from "@/lib/sse-emitter";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      chiffon: {
        select: { id: true, title: true, ownerPhone: true },
      },
    },
  });

  return NextResponse.json(
    submissions.map((s) => ({
      id: s.id,
      chiffonId: s.chiffonId,
      chiffonTitle: s.chiffon.title,
      ownerPhone: s.chiffon.ownerPhone,
      floor: s.floor,
      roomNumber: s.roomNumber,
      value: s.value,
      packageType: s.packageType,
      createdAt: s.createdAt.toISOString(),
    }))
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { chiffonId, floor, roomNumber, items, value, packageType } = body;

  if (!chiffonId || !floor?.trim() || !roomNumber?.trim()) {
    return NextResponse.json(
      { error: "Floor and Room number are required" },
      { status: 400 }
    );
  }

  const chiffon = await prisma.chiffon.findUnique({ where: { id: chiffonId } });
  if (!chiffon) {
    return NextResponse.json({ error: "Chiffon not found" }, { status: 404 });
  }

  // Handle multi-item array
  if (Array.isArray(items) && items.length > 0) {
    for (const item of items) {
      if (!item.value?.trim() || !["TAQA", "SIRY", "METER"].includes(item.packageType)) {
        return NextResponse.json(
          { error: "Each selected package requires a valid value" },
          { status: 400 }
        );
      }
    }

    await prisma.submission.createMany({
      data: items.map((item: { packageType: "TAQA" | "SIRY" | "METER"; value: string }) => ({
        chiffonId,
        floor: floor.trim(),
        roomNumber: roomNumber.trim(),
        value: item.value.trim(),
        packageType: item.packageType,
      })),
    });

    // 🔴 Broadcast real-time SSE event to all connected admin browsers
    emitSSEEvent("submission-created", {
      type: "submission-created",
      chiffonId,
      chiffonTitle: chiffon.title,
      ownerName: chiffon.ownerName,
      floor: floor.trim(),
      roomNumber: roomNumber.trim(),
      timestamp: Date.now(),
    });

    return NextResponse.json(
      {
        message: "Your information has been submitted to the admin.",
        chiffonId,
        chiffonTitle: chiffon.title,
        ownerName: chiffon.ownerName,
        floor: floor.trim(),
        roomNumber: roomNumber.trim(),
      },
      { status: 201 }
    );
  }

  // Backward compatibility for single submission
  if (!value?.trim() || !["TAQA", "SIRY", "METER"].includes(packageType)) {
    return NextResponse.json(
      { error: "Package type and value are required" },
      { status: 400 }
    );
  }

  const submission = await prisma.submission.create({
    data: {
      chiffonId,
      floor: floor.trim(),
      roomNumber: roomNumber.trim(),
      value: value.trim(),
      packageType,
    },
  });

  // 🔴 Broadcast real-time SSE event to all connected admin browsers
  emitSSEEvent("submission-created", {
    type: "submission-created",
    chiffonId,
    chiffonTitle: chiffon.title,
    ownerName: chiffon.ownerName,
    floor: floor.trim(),
    roomNumber: roomNumber.trim(),
    timestamp: Date.now(),
  });

  return NextResponse.json(
    {
      id: submission.id,
      message: "Your information has been submitted to the admin.",
      chiffonId,
      chiffonTitle: chiffon.title,
      ownerName: chiffon.ownerName,
      floor: floor.trim(),
      roomNumber: roomNumber.trim(),
    },
    { status: 201 }
  );
}
