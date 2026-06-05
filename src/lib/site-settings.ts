import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@/types/settings";

const DEFAULTS: SiteSettings = {
  whatsapp_primary: process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643",
  whatsapp_secondary: process.env.NEXT_PUBLIC_WHATSAPP_SECONDARY ?? "556230986879",
  ga_measurement_id: "",
  meta_pixel_id: "",
  google_site_verification: "",
  business_hours_weekdays: "Seg–Sex: 08h às 18h",
  business_hours_saturday: "Sábado: 08h às 12h",
  business_hours_sunday: "Domingo: fechado",
  address: "",
  instagram_url: "#",
  facebook_url: "#",
  email: "contato@cearaautoeletrica.com.br"
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULTS, ...map } as SiteSettings;
  } catch {
    return { ...DEFAULTS };
  }
}
