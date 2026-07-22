import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { toPublicChiffon } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const isAdmin = await isAdminAuthenticated();

  if (isAdmin) {
    const chiffon = await prisma.chiffon.findUnique({
      where: { id },
      include: { submissions: { orderBy: { createdAt: "desc" } } },
    });

    if (!chiffon) {
      return NextResponse.json({ error: "Chiffon not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...toPublicChiffon(chiffon),
      ownerName: chiffon.ownerName,
      ownerPhone: chiffon.ownerPhone,
      submissions: chiffon.submissions.map((s) => ({
        id: s.id,
        chiffonId: s.chiffonId,
        floor: s.floor,
        roomNumber: s.roomNumber,
        value: s.value,
        packageType: s.packageType,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  }

  const chiffon = await prisma.chiffon.findUnique({ where: { id } });

  if (!chiffon) {
    return NextResponse.json({ error: "Chiffon not found" }, { status: 404 });
  }

  return NextResponse.json(toPublicChiffon(chiffon));
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const chiffon = await prisma.chiffon.findUnique({ where: { id } });
  if (!chiffon) {
    return NextResponse.json({ error: "Chiffon not found" }, { status: 404 });
  }

  await prisma.chiffon.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, titleAm, description, descriptionAm, images, ownerName, ownerPhone } =
      body;

    if (
      !title?.trim() ||
      !titleAm?.trim() ||
      !description?.trim() ||
      !descriptionAm?.trim() ||
      !ownerName?.trim() ||
      !ownerPhone?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Title, Amharic title, description, Amharic description, owner name, and owner phone are required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.chiffon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Chiffon not found" }, { status: 404 });
    }

    const chiffon = await prisma.chiffon.update({
      where: { id },
      data: {
        title: title.trim(),
        titleAm: titleAm.trim(),
        description: description.trim(),
        descriptionAm: descriptionAm.trim(),
        images: JSON.stringify(images),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
      },
    });

    return NextResponse.json(toPublicChiffon(chiffon));
  } catch (error) {
    console.error("PUT /api/chiffons/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to update chiffon. Please try again." },
      { status: 500 },
    );
  }
}
