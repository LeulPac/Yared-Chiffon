import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { parseImages } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chiffons = await prisma.chiffon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submissions: { orderBy: { createdAt: "desc" } },
      _count: { select: { submissions: true } },
    },
  });

  return NextResponse.json(
    chiffons.map((c) => ({
      id: c.id,
      title: c.title,
      titleAm: c.titleAm,
      description: c.description,
      descriptionAm: c.descriptionAm,
      images: parseImages(c.images),
      ownerPhone: c.ownerPhone,
      createdAt: c.createdAt.toISOString(),
      submissionCount: c._count.submissions,
      submissions: c.submissions.map((s) => ({
        id: s.id,
        chiffonId: s.chiffonId,
        floor: s.floor,
        roomNumber: s.roomNumber,
        value: s.value,
        packageType: s.packageType,
        createdAt: s.createdAt.toISOString(),
      })),
    }))
  );
}
