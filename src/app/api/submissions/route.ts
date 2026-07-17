import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

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
  const { chiffonId, floor, roomNumber, value, packageType } = body;

  if (!chiffonId || !floor?.trim() || !roomNumber?.trim() || !value?.trim()) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (!["TAQA", "SIRY", "METER"].includes(packageType)) {
    return NextResponse.json(
      { error: "Invalid package type" },
      { status: 400 }
    );
  }

  const chiffon = await prisma.chiffon.findUnique({ where: { id: chiffonId } });
  if (!chiffon) {
    return NextResponse.json({ error: "Chiffon not found" }, { status: 404 });
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

  return NextResponse.json(
    {
      id: submission.id,
      message: "Your information has been submitted to the admin.",
    },
    { status: 201 }
  );
}
