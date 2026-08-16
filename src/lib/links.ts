/**
 * Single source of truth for every outbound destination on the marketing site.
 * Keep booking, product and messaging links here so a URL change is a one-line edit.
 */

/** Every "book a call" surface points here. */
export const BOOK_A_CALL = "https://cal.com/almmatix";

export const WHATSAPP_NUMBER = "919344110272";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** ASVA — our Tally→WhatsApp collections product. */
export const ASVA = {
  home: "https://tryasva.com",
  howItWorks: "https://tryasva.com/how-it-works",
  features: "https://tryasva.com/features",
  guide: "https://tryasva.com/guide",
  useCases: "https://tryasva.com/use-cases",
  download: "https://tryasva.com/download",
} as const;

/** DoItForMe — the student workforce marketplace we engineered. */
export const DOITFORME = {
  home: "https://doitforme.in",
  hire: "https://doitforme.in/company/onboarding",
  earn: "https://doitforme.in/login",
  about: "https://doitforme.in/about",
} as const;

export const CONTACT = {
  email: "almmatix@gmail.com",
  phone: "+91 9344110272",
} as const;
