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
    const { title, titleAm, description, descriptionAm, images, ownerPhone } =
      body;

    if (
      !title?.trim() ||
      !titleAm?.trim() ||
      !description?.trim() ||
      !descriptionAm?.trim() ||
      !ownerPhone?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Title, Amharic title, description, Amharic description, and owner phone are required",
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
        ownerPhone: ownerPhone.trim(),
      },
    });

    return NextResponse.json(toPublicChiffon(chiffon), { status: 201 });
  } catch (error) {
    console.error("POST /api/chiffons failed:", error);
    return NextResponse.json(
      { error: "Failed to create chiffon. Please try again." },
      { status: 500 },
    );
  }
}
