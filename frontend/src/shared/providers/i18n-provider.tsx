"use client";

import { useEffect } from "react";

import i18n from "@/shared/lib/i18n";
import { getPreferredLanguage } from "@/shared/lib/language-storage";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Get language preference: stored cookie > browser preference > default
    const lang = getPreferredLanguage();
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, []);

  return <>{children}</>;
}
