"use client";

import { LOCALES } from "@matriwatch/shared";
import { useLanguage } from "@/components/LanguageProvider";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border p-0.5 text-xs font-semibold ${className ?? ""}`}
      style={{ borderColor: "#EDE8E3" }}
      role="group"
      aria-label={t("language.toggleLabel")}
    >
      {LOCALES.map((option) => {
        const active = option.code === locale;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLocale(option.code)}
            className="rounded-full px-2.5 py-1 transition-colors"
            style={{
              backgroundColor: active ? "#C97C8A" : "transparent",
              color: active ? "#FFFFFF" : "#7A7A8A",
            }}
            aria-pressed={active}
          >
            {option.code === "en" ? "EN" : "বাং"}
          </button>
        );
      })}
    </div>
  );
}
