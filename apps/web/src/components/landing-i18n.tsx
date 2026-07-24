"use client";

import Link from "next/link";
import { ArrowRight, Globe, BarChart3, Smartphone, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function HeroBadge() {
  const { t } = useLanguage();
  return (
    <div
      className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
      style={{ backgroundColor: "#FCE8EE", color: "#C94F6D" }}
    >
      <Globe className="w-3.5 h-3.5" />
      {t("landing.hero.badge")}
    </div>
  );
}

export function HeroHeading() {
  const { t } = useLanguage();
  return (
    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6" style={{ color: "#2D2D2D" }}>
      {t("landing.hero.title")}
    </h1>
  );
}

export function HeroSubtitle() {
  const { t } = useLanguage();
  return (
    <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: "#7A7A8A" }}>
      {t("landing.hero.subtitle")}
    </p>
  );
}

export function HeroCtas() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
      <Link
        href="/register"
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-base font-semibold rounded-xl transition-colors"
        style={{ backgroundColor: "#C97C8A", boxShadow: "0 4px 14px rgba(201,124,138,0.30)" }}
      >
        {t("landing.hero.getStarted")} <ArrowRight className="w-4 h-4" />
      </Link>
      <a
        href="#features"
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl border transition-colors"
        style={{ borderColor: "#EDE8E3", color: "#7A7A8A", backgroundColor: "white" }}
      >
        {t("landing.hero.learnMore")}
      </a>
    </div>
  );
}

export function WorldHeading() {
  const { t } = useLanguage();
  return (
    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{t("landing.world.title")}</h2>
  );
}

export function WorldSubtitle() {
  const { t } = useLanguage();
  return (
    <p className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: "#FCE8EE" }}>
      {t("landing.world.subtitle")}
    </p>
  );
}

export function WorldFeatures() {
  const { t } = useLanguage();
  const items = [
    { Icon: BarChart3, label: t("landing.world.language") },
    { Icon: Smartphone, label: t("landing.world.devices") },
    { Icon: ShieldCheck, label: t("landing.world.guidelines") },
  ];
  return (
    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ backgroundColor: "rgba(255,255,255,0.20)" }}
          >
            <item.Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs leading-snug" style={{ color: "#FCE8EE" }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function WorldCta() {
  const { t } = useLanguage();
  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
      style={{ backgroundColor: "white", color: "#C97C8A", boxShadow: "0 4px 14px rgba(0,0,0,0.10)" }}
    >
      {t("landing.world.cta")} <ArrowRight className="w-4 h-4" />
    </Link>
  );
}
