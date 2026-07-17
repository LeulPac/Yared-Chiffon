import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const url = await uploadImage(buffer, filename);
      urls.push(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Cloudinary upload failed:", message, err);
      return NextResponse.json(
        { error: `Image upload failed: ${message}` },
        { status: 500 },
      );
    }
  }

  if (!urls.length) {
    return NextResponse.json(
      { error: "No valid images uploaded" },
      { status: 400 },
    );
  }

  return NextResponse.json({ urls });
}
