"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShieldCheck, Stethoscope, Users, Eye, EyeOff, AlertCircle } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

const ROLES = [
  {
    id: "Admin",
    label: "Admin",
    description: "Clinic administrator",
    icon: ShieldCheck,
    iconColor: "#7A5A92",
    iconBg: "#F3ECF9",
    activeBorder: "#7A5A92",
    activeBg: "#F3ECF9",
    buttonColor: "#7A5A92",
    redirect: "/admin",
  },
  {
    id: "Doctor",
    label: "Doctor",
    description: "Physician / Obstetrician",
    icon: Stethoscope,
    iconColor: "#C97C8A",
    iconBg: "#F9EDF1",
    activeBorder: "#C97C8A",
    activeBg: "#F9EDF1",
    buttonColor: "#C97C8A",
    redirect: "/dashboard",
  },
  {
    id: "Nurse",
    label: "Nurse / CHW",
    description: "Shift staff or field worker",
    icon: Users,
    iconColor: "#87A878",
    iconBg: "#F0F7ED",
    activeBorder: "#87A878",
    activeBg: "#F0F7ED",
    buttonColor: "#87A878",
    redirect: "/dashboard",
  },
  {
    id: "Mother",
    label: "Mother",
    description: "Pregnant or postpartum",
    icon: Heart,
    iconColor: "#C94F6D",
    iconBg: "#FCE8EE",
    activeBorder: "#C94F6D",
    activeBg: "#FCE8EE",
    buttonColor: "#C94F6D",
    redirect: "/mother",
  },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<RoleId>("Doctor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedRole = ROLES.find((r) => r.id === role)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(t("login.missingFields"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("login.invalidCredentials"));
        return;
      }

      const authRole = data.role as RoleId;
      const matchedRole = ROLES.find((r) => r.id === authRole) ?? selectedRole;

      try {
        localStorage.setItem(
          "matriwatch_auth",
          JSON.stringify({ email: data.email, name: data.name, role: authRole })
        );
      } catch {
        // Storage may be unavailable — non-fatal.
      }

      router.push(matchedRole.redirect);
    } catch {
      setError(t("login.serverUnreachable"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-3 flex justify-end">
          <LanguageToggle />
        </div>
        <div
          className="rounded-2xl bg-white p-8"
          style={{ boxShadow: "0 4px 24px rgba(201,124,138,0.12)" }}
        >
          {/* Logo */}
          <div className="mb-7 flex flex-col items-center">
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#FCE8EE" }}
            >
              <Heart className="h-7 w-7" style={{ color: "#C97C8A", fill: "#C97C8A" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#C97C8A" }}>
              {t("layout.appName")}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#7A7A8A" }}>
              {t("login.tagline")}
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <p className="mb-2.5 text-xs font-medium" style={{ color: "#2D2D2D" }}>
              {t("register.role")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all"
                    style={{
                      borderColor: active ? r.activeBorder : "#EDE8E3",
                      backgroundColor: active ? r.activeBg : "#FFFFFF",
                    }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: active ? r.iconBg : "#F7F4F1" }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: active ? r.iconColor : "#7A7A8A" }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold leading-tight"
                      style={{ color: active ? "#2D2D2D" : "#7A7A8A" }}
                    >
                      {r.label}
                    </span>
                    <span
                      className="leading-tight"
                      style={{ color: active ? "#7A7A8A" : "#AEAEB8", fontSize: "10px" }}
                    >
                      {r.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "#2D2D2D" }}
              >
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "Mother"
                    ? "fatima@matriwatch.app"
                    : role === "Nurse"
                    ? "kamrun@clinic.app"
                    : role === "Admin"
                    ? "admin@matriwatch.app"
                    : "dr.rahim@dhakaclinic.app"
                }
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{ borderColor: "#EDE8E3", color: "#2D2D2D", backgroundColor: "#FFFFFF" }}
                onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "#2D2D2D" }}
              >
                {t("login.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm outline-none transition-all"
                  style={{ borderColor: "#EDE8E3", color: "#2D2D2D", backgroundColor: "#FFFFFF" }}
                  onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                  onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#AEAEB8" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg p-3" style={{ backgroundColor: "#FFF3F6", border: "1px solid #F9B8C4" }}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#C94F6D" }} />
                <p className="text-xs" style={{ color: "#C94F6D" }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-70"
              style={{ backgroundColor: selectedRole.buttonColor }}
            >
              {loading ? t("login.submitting") : t("login.signInAs", { role: selectedRole.label })}
            </button>
          </form>

          <p className="mt-5 text-center text-xs" style={{ color: "#7A7A8A" }}>
            {t("login.noAccount")}{" "}
            <Link href="/register" className="font-semibold" style={{ color: "#C97C8A" }}>
              {t("login.registerLink")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
