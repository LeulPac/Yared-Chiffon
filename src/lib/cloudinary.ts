import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const base64 = buffer.toString("base64");
  const dataUri = `data:image/webp;base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "yared-chiffon",
    public_id: filename,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return result.secure_url;
}

export default cloudinary;
