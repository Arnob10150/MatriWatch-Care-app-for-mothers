"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShieldCheck, Stethoscope, Users, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

const ROLES = [
  {
    id: "Admin" as const,
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
    id: "Doctor" as const,
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
    id: "Nurse" as const,
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
    id: "Mother" as const,
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

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleId>("Doctor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [age, setAge] = useState("");
  const [gestationalAge, setGestationalAge] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedRole = ROLES.find((r) => r.id === role)!;

  const inputStyle = {
    borderColor: "#EDE8E3",
    color: "#2D2D2D",
    backgroundColor: "#FFFFFF",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please enter your full name and email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (role === "Mother" && !age) {
      setError("Please enter your age.");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };
      if (role === "Mother") {
        body.age = Number(age);
        if (gestationalAge) body.gestational_age = Number(gestationalAge);
        if (dueDate) body.due_date = dueDate;
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      try {
        localStorage.setItem(
          "matriwatch_auth",
          JSON.stringify({ email: data.email, name: data.name, role: data.role })
        );
      } catch {
        // Storage unavailable — non-fatal
      }

      setSuccess(true);
      setTimeout(() => router.push(selectedRole.redirect), 1500);
    } catch {
      setError("Could not reach the server. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="w-full max-w-sm text-center">
          <div className="rounded-2xl bg-white p-10" style={{ boxShadow: "0 4px 24px rgba(201,124,138,0.12)" }}>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "#87A878" }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: "#2D2D2D" }}>Account Created!</h2>
            <p className="text-sm" style={{ color: "#7A7A8A" }}>
              Welcome, <strong>{name}</strong>. Taking you to your dashboard…
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 py-10" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8" style={{ boxShadow: "0 4px 24px rgba(201,124,138,0.12)" }}>

          {/* Logo */}
          <div className="mb-7 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#FCE8EE" }}>
              <Heart className="h-7 w-7" style={{ color: "#C97C8A", fill: "#C97C8A" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#C97C8A" }}>Create Account</h1>
            <p className="mt-1 text-sm" style={{ color: "#7A7A8A" }}>Join MatriWatch to start monitoring</p>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <p className="mb-2.5 text-xs font-medium" style={{ color: "#2D2D2D" }}>I am a…</p>
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: active ? r.iconBg : "#F7F4F1" }}>
                      <Icon className="h-4 w-4" style={{ color: active ? r.iconColor : "#7A7A8A" }} />
                    </div>
                    <span className="text-xs font-semibold leading-tight" style={{ color: active ? "#2D2D2D" : "#7A7A8A" }}>
                      {r.label}
                    </span>
                    <span className="leading-tight" style={{ color: active ? "#7A7A8A" : "#AEAEB8", fontSize: "10px" }}>
                      {r.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "Mother" ? "Fatima Rahman" : "Dr. Rahim"}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "Mother" ? "fatima@matriwatch.app" : "dr.rahim@clinic.app"}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm outline-none transition-all"
                  style={inputStyle}
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

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                  onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#AEAEB8" }}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p className="mt-1 text-xs" style={{ color: password === confirmPassword ? "#87A878" : "#C94F6D" }}>
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Mother-only fields */}
            {role === "Mother" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>
                      Age <span style={{ color: "#C94F6D" }}>*</span>
                    </label>
                    <input
                      type="number"
                      min={14}
                      max={60}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="27"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                      onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Weeks pregnant</label>
                    <input
                      type="number"
                      min={0}
                      max={42}
                      value={gestationalAge}
                      onChange={(e) => setGestationalAge(e.target.value)}
                      placeholder="28"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                      onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>
                    Due date <span style={{ color: "#7A7A8A", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#F9B8C4")}
                    onBlur={(e) => (e.target.style.borderColor = "#EDE8E3")}
                  />
                </div>
              </>
            )}

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
              {loading ? "Creating account…" : `Register as ${selectedRole.label}`}
            </button>
          </form>

          <p className="mt-5 text-center text-xs" style={{ color: "#7A7A8A" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#C97C8A" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
