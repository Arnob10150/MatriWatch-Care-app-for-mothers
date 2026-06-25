import { useState } from "react";
import { useLocation } from "wouter";
import { Heart, Stethoscope, Users } from "lucide-react";
import { setAuth } from "@/lib/auth";
import { playLoginSuccess, playTap } from "@/lib/sounds";

const ROLES = [
  {
    id: "Mother",
    label: "Mother",
    description: "Pregnant or postpartum",
    icon: Heart,
    iconColor: "#C94F6D",
    iconBg: "#FCE8EE",
    activeBorder: "#C97C8A",
    activeBg: "#FCE8EE",
    buttonColor: "#C94F6D",
  },
  {
    id: "Clinic Staff",
    label: "Clinic Staff",
    description: "Doctor, nurse or obstetrician",
    icon: Stethoscope,
    iconColor: "#C97C8A",
    iconBg: "#F9EDF1",
    activeBorder: "#C97C8A",
    activeBg: "#F9EDF1",
    buttonColor: "#C97C8A",
  },
  {
    id: "Community Health Worker",
    label: "Health Worker",
    description: "Field CHW or home visitor",
    icon: Users,
    iconColor: "#87A878",
    iconBg: "#F0F7ED",
    activeBorder: "#87A878",
    activeBg: "#F0F7ED",
    buttonColor: "#87A878",
  },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Clinic Staff");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedRole = ROLES.find(r => r.id === role)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    setAuth({ email, name, role });
    playLoginSuccess();
    setLoading(false);
    // Route based on role
    if (role === "Mother") {
      setLocation("/mother/home");
    } else {
      setLocation("/dashboard");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="w-full max-w-sm">
        <div
          className="bg-white rounded-2xl p-8"
          style={{ boxShadow: "0 4px 24px rgba(201,124,138,0.12)" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "#FCE8EE" }}
            >
              <Heart className="w-7 h-7" style={{ color: "#C97C8A", fill: "#C97C8A" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#C97C8A" }}>MatriWatch</h1>
            <p className="text-sm mt-1" style={{ color: "#7A7A8A" }}>
              Caring for every mother, every day
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <p className="text-xs font-medium mb-2.5" style={{ color: "#2D2D2D" }}>
              I am a...
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { playTap(); setRole(r.id); }}
                    className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all"
                    style={{
                      borderColor: active ? r.activeBorder : "#EDE8E3",
                      backgroundColor: active ? r.activeBg : "#FFFFFF",
                    }}
                    data-testid={`role-${r.id.toLowerCase().replace(/ /g, "-")}`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: active ? r.iconBg : "#F7F4F1" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: active ? r.iconColor : "#7A7A8A" }} />
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
              <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: "#2D2D2D" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={
                  role === "Mother"
                    ? "fatima@matriwatch.app"
                    : role === "Community Health Worker"
                    ? "kamrun@chw.app"
                    : "dr.rahim@dhakaclinic.app"
                }
                className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none transition-all"
                style={{ borderColor: "#EDE8E3", color: "#2D2D2D", backgroundColor: "#FFFFFF" }}
                onFocus={e => (e.target.style.borderColor = "#F9B8C4")}
                onBlur={e => (e.target.style.borderColor = "#EDE8E3")}
                data-testid="input-email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: "#2D2D2D" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none transition-all"
                style={{ borderColor: "#EDE8E3", color: "#2D2D2D", backgroundColor: "#FFFFFF" }}
                onFocus={e => (e.target.style.borderColor = "#F9B8C4")}
                onBlur={e => (e.target.style.borderColor = "#EDE8E3")}
                data-testid="input-password"
              />
            </div>

            {error && <p className="text-xs" style={{ color: "#C94F6D" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-70"
              style={{ backgroundColor: selectedRole.buttonColor }}
              onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.filter = "brightness(0.9)")}
              onMouseLeave={e => !loading && ((e.currentTarget as HTMLElement).style.filter = "none")}
              data-testid="button-signin"
            >
              {loading ? "Signing in..." : `Sign In as ${selectedRole.label}`}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: "#7A7A8A" }}>
            Enter any credentials to continue
          </p>
        </div>
      </div>
    </div>
  );
}
