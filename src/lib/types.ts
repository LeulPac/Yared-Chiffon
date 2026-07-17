export type PublicChiffon = {
  id: string;
  title: string;
  titleAm: string;
  description: string;
  descriptionAm: string;
  images: string[];
  createdAt: string;
};

export type AdminChiffon = PublicChiffon & {
  ownerPhone: string;
  submissions: AdminSubmission[];
};

export type AdminSubmission = {
  id: string;
  chiffonId: string;
  floor: string;
  roomNumber: string;
  value: string;
  packageType: "TAQA" | "SIRY" | "METER";
  createdAt: string;
};

export const PACKAGE_TYPES = [
  { value: "TAQA", label: "TAQA" },
  { value: "SIRY", label: "Siry" },
  { value: "METER", label: "In Meter" },
] as const;

export function parseImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toPublicChiffon(chiffon: {
  id: string;
  title: string;
  titleAm: string;
  description: string;
  descriptionAm: string;
  images: string;
  createdAt: Date;
}): PublicChiffon {
  return {
    id: chiffon.id,
    title: chiffon.title,
    titleAm: chiffon.titleAm,
    description: chiffon.description,
    descriptionAm: chiffon.descriptionAm,
    images: parseImages(chiffon.images),
    createdAt: chiffon.createdAt.toISOString(),
  };
}
