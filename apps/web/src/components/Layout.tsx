import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Bell, LogOut, Heart,
  ClipboardCheck,
} from "lucide-react";
import { clearAuth, getAuth } from "@/lib/auth";
import { useListAlerts } from "@workspace/api-client-react";
import { playTap } from "@/lib/sounds";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const DOCTOR_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: true },
];

const NURSE_NAV = [
  { href: "/nurse", label: "My Shift", icon: ClipboardCheck },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: true },
];

function UnreadBadge() {
  const { data: alerts } = useListAlerts({ is_read: false });
  const count = alerts?.filter(a => !a.is_read).length ?? 0;
  if (count === 0) return null;
  return (
    <span
      className="ml-auto text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center"
      style={{ backgroundColor: "#FCE8EE", color: "#C94F6D" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Layout({ children, title }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const user = getAuth();
  const isNurse = user?.role === "Community Health Worker";
  const NAV = isNurse ? NURSE_NAV : DOCTOR_NAV;

  function handleSignOut() {
    clearAuth();
    setLocation("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-58 flex-shrink-0 flex flex-col"
        style={{ backgroundColor: "#C97C8A", width: 232 }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-white fill-white" />
            <span className="text-white font-bold text-lg tracking-tight">MatriWatch</span>
          </div>
          <p className="text-white/60 text-xs mt-1">
            {isNurse ? "Nurse portal" : "Doctor portal"}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active = location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-white" : "text-white hover:bg-white/20"
                }`}
                style={active ? { color: "#C97C8A" } : {}}
                onClick={() => !active && playTap()}
                data-testid={`nav-${label.toLowerCase().replace(/ /g, "-")}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {badge && <UnreadBadge />}
              </Link>
            );
          })}
        </nav>

        {/* Role label */}
        <div className="px-5 py-3 mx-3 mb-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
          <p className="text-white/80 text-xs font-medium">{user?.role ?? "Staff"}</p>
          <p className="text-white/50 text-xs truncate">{user?.email ?? ""}</p>
        </div>

        {/* User + sign out */}
        <div className="px-3 pb-4 border-t border-white/20 pt-3">
          <div className="flex items-center gap-3 px-3 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "white" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? "S"}
            </div>
            <p className="text-white text-sm font-medium truncate">{user?.name ?? "Staff"}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-xl text-white/80 hover:bg-white/20 text-sm transition-all"
            data-testid="button-signout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="flex items-center justify-between px-6 py-4 bg-white border-b flex-shrink-0"
          style={{ borderColor: "#EDE8E3" }}
        >
          <h1 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>{title}</h1>
        </header>
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: "#FFF8F0" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
