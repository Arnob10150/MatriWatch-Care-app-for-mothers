"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export function LandingNavbar() {
  const [loginHover, setLoginHover] = useState(false);
  const { t } = useLanguage();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur border-b"
      style={{
        backgroundColor: "rgba(255,248,240,0.97)",
        borderColor: "#EDE8E3",
        boxShadow: "0 1px 8px rgba(201,124,138,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#FCE8EE" }}
          >
            <Heart className="w-5 h-5" style={{ color: "#C97C8A", fill: "#C97C8A" }} />
          </div>
          <div>
            <span className="text-lg font-bold" style={{ color: "#C97C8A" }}>
              MatriWatch
            </span>
            <p
              className="text-[10px] font-medium tracking-wide leading-none mt-0.5"
              style={{ color: "#AEAEB8" }}
            >
              MATERNAL HEALTH
            </p>
          </div>
        </Link>

        {/* Right: Language + Login + Register */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold rounded-xl border transition-colors"
            style={{
              color: "#C97C8A",
              borderColor: "#F9B8C4",
              backgroundColor: loginHover ? "#FCE8EE" : "transparent",
            }}
            onMouseEnter={() => setLoginHover(true)}
            onMouseLeave={() => setLoginHover(false)}
          >
            {t("landing.nav.login")}
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
            style={{ backgroundColor: "#C97C8A" }}
          >
            {t("landing.nav.register")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
