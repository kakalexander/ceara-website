"use client";

import { createContext, useContext } from "react";

import type { SiteSettings } from "@/types/settings";

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_primary: "5562992002643",
  whatsapp_secondary: "556230986879",
  ga_measurement_id: "",
  meta_pixel_id: "",
  business_hours_weekdays: "Seg–Sex: 08h às 18h",
  business_hours_saturday: "Sábado: 08h às 12h",
  business_hours_sunday: "Domingo: fechado",
  address: "",
  instagram_url: "#",
  facebook_url: "#",
  email: "contato@cearaautoeletrica.com.br"
};

const SettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({
  settings,
  children
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}): JSX.Element {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SiteSettings {
  return useContext(SettingsContext);
}
