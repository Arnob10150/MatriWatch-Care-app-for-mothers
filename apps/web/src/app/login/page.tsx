"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Stethoscope, Users } from "lucide-react";

const ROLES = [
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
    redirect: "/nurse",
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleId>("Doctor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedRole = ROLES.find((r) => r.id === role)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const name = email
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (typeof window !== "undefined") {
      localStorage.setItem("matriwatch_auth", JSON.stringify({ email, name, role }));
    }
    setLoading(false);
    router.push(selectedRole.redirect);
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="w-full max-w-sm">
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
              MatriWatch
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#7A7A8A" }}>
              Caring for every mother, every day
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <p className="mb-2.5 text-xs font-medium" style={{ color: "#2D2D2D" }}>
              I am a…
            </p>
            <div className="grid grid-cols-3 gap-2">
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
                Email address
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
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{ borderColor: "#EDE8E3", color: "#2D2D2D", backgroundColor: "#FFFFFF" }}
                onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
              />
            </div>

            {error && (
              <p className="text-xs" style={{ color: "#C94F6D" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-70"
              style={{ backgroundColor: selectedRole.buttonColor }}
            >
              {loading ? "Signing in…" : `Sign in as ${selectedRole.label}`}
            </button>
          </form>

          <p className="mt-5 text-center text-xs" style={{ color: "#7A7A8A" }}>
            Demo — enter any credentials to continue
          </p>
        </div>
      </div>
    </main>
  );
}
