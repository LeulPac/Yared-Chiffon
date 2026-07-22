import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { toPublicChiffon } from "@/lib/types";

export async function GET() {
  const chiffons = await prisma.chiffon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(chiffons.map(toPublicChiffon), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
        { status: 400 },
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 },
      );
    }

    const chiffon = await prisma.chiffon.create({
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

    return NextResponse.json(toPublicChiffon(chiffon), { status: 201 });
  } catch (error) {
    console.error("POST /api/chiffons failed:", error);
    const msg = error instanceof Error ? error.message : "Failed to create chiffon. Please try again.";
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    );
  }
}
