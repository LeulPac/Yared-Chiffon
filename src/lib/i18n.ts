export type Locale = "en" | "am";

export const translations = {
  en: {
    collection: "Collection",
    about: "About",
    contact: "Contact",
    heroLine:
      "Ethiopian cultural chiffon — heritage folds for modern presence.",
    browseCollection: "Browse Collection",
    findYourChiffon: "Find your chiffon",
    collectionIntro:
      "Browse pieces, open a design, and tell us if you already have it.",
    searchPlaceholder: "Search by title or description...",
    viewDetails: "View details →",
    doYouHave: "Do you have this chiffon?",
    aboutTitle: "Tradition woven with intention",
    aboutBody:
      "Yared Chiffon celebrates Ethiopian cultural cloth — refined pieces, careful detail, and a quiet elegance you can claim as your own.",
    footerBlurb:
      "Ethiopian cultural chiffon crafted for presence — heritage woven into every fold.",
    explore: "Explore",
    reachOut: "Reach out",
    phone: "Phone",
    email: "Email",
    location: "Location",
    tagline: "Tradition. Elegance. You.",
    rightsReserved: "All rights reserved.",
    emptyCollection: "No chiffons posted yet. Check back soon!",
    noSearchResults: "No chiffons match your search.",
    thankYou: "Thank you! Your information has been sent to the admin.",
    language: "Language",
    haveThisChiffon: "I have this chiffon",
    floor: "Floor",
    seeMore: "See more",
    roomNumber: "Room Number",
    value: "Value",
    enterValue: "Enter value",
    packageType: "Package Type",
    packageTaqa: "TAQA",
    packageSiry: "SERI",
    packageMeter: "IN METER",
    cancel: "Cancel",
    submit: "Submit",
    submitting: "Submitting...",
  },
  am: {
    collection: "ስብስብ",
    about: "ስለኛ",
    contact: "ያግኙን",
    heroLine: "የኢትዮጵያ ባህላዊ ሽፎን — ቅርሳዊ ጥለት ለዘመናዊነት",
    browseCollection: "ስብስብ ያስሱ",
    findYourChiffon: "ሽፎንዎን ያግኙ",
    collectionIntro: "እዚህ ይፈልጉ፣ ዲዛይን ያውጡ እና እርስዎ ጋር ካለ ያሳውቁን",
    searchPlaceholder: "በዓይነት ወይ በመግለጫዎች ይፈልጉ",
    viewDetails: "ዝርዝር ይመልከቱ →",
    doYouHave: "ይህንን ሽፎን አሎት?",
    aboutTitle: "በዓላማ የተሸመነ ባህላዊ ልብስ",
    aboutBody:
      "ያሬድ ሽፎን የኢትዮጵያን የባህል ጨርቅ ያከብራል - የተጣሩ ቁርጥራጮች፣ ጥንቃቄ የተሞላባቸው ዝርዝሮች እና ለራስዎ ሊፈጥሩት የሚችሉት ውበት።",
    footerBlurb:
      "ለአሁን ዘመን የተነደፈ የኢትዮጵያ የባህል ልብስ — በያንዳንዱ እጥፋት የቅርስ ሽመና ያለበት",
    explore: "ይዳስሱ",
    reachOut: "ያግኙን",
    phone: "ስልክ",
    email: "ኢሜል",
    location: "ቦታ (ሎኬሽን)",
    tagline: "ባህል. ውበት. እርስዎ",
    rightsReserved: "ሁሉ መብት በህግ የተጠበቀ ነው",
    emptyCollection: "እስካሁን ሽፎን አልተለጠፈም። ብዙም ሳይቆይ ይመልሰቱ!",
    noSearchResults: "ከፍለጋዎ ጋር የሚዛመድ ሽፎን አልተገኘም።",
    thankYou: "አመሰግናለን! መረጃዎ ለአስተዳዳሪው ተልኳል።",
    language: "ቋንቋ",
    haveThisChiffon: "ይህንን ሽፎን አለኝ",
    floor: "ፎቅ",
    seeMore: "ብዙ ይመልከቱ",
    roomNumber: "የክፍል ቁጥር",
    value: "ዋጋ",
    enterValue: "ዋጋ አስገባ ",
    packageType: "የጥቅል አይነት",
    packageTaqa: "ጣቃ",
    packageSiry: "ሴሪ",
    packageMeter: "በሜትር",
    cancel: "አጥፋ",
    submit: "ላክ",
    submitting: "እየላከ ነው...",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function localizedText(
  en: string,
  am: string | null | undefined,
  locale: Locale,
): string {
  if (locale === "am" && am?.trim()) return am.trim();
  return en;
}
