"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BellRing,
  HeartPulse,
  LineChart,
  LogOut,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearAuth, getAuth, type AuthUser } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/alerts", label: "Alerts", icon: BellRing },
  { href: "/reports", label: "Reports", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function ClinicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }
    setUser(auth);
    setCheckedAuth(true);
  }, [router]);

  function handleSignOut() {
    clearAuth();
    router.push("/login");
  }

  if (!checkedAuth) {
    return null;
  }

  const displayName = user?.name ?? "Guest";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col bg-primary text-white lg:flex">
        <div className="border-b border-white/20 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
              <HeartPulse className="h-5 w-5 text-white" fill="rgba(255,255,255,0.18)" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-normal">MatriWatch</h1>
              <p className="text-xs font-medium text-white/75">Clinic Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Care</p>
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/patients" && pathname.startsWith("/patients/"));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-white text-primary" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/20 p-4">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
              {initials || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs text-white/70">{user?.role ?? "Not signed in"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <div className="border-b border-border bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              <span className="font-semibold">MatriWatch</span>
            </div>
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <div className="animate-enter">{children}</div>
      </div>
    </div>
  );
}
