"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, Clock, MessageCircle, LogOut, Heart } from "lucide-react";
import { clearAuth, getAuth, type AuthUser } from "@/lib/auth";
import { MotherChatbot } from "@/components/MotherChatbot";
import { playTap } from "@/lib/sounds";

interface MotherLayoutProps {
  children: ReactNode;
  title?: string;
}

const NAV = [
  { href: "/mother", label: "Home", icon: Home },
  { href: "/mother/checkin", label: "Check In", icon: ClipboardList },
  { href: "/mother/epds", label: "Mood Check", icon: MessageCircle },
  { href: "/mother/history", label: "History", icon: Clock },
] as const;

export function MotherLayout({ children, title }: MotherLayoutProps) {
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
              <Heart className="h-5 w-5 text-white" fill="rgba(255,255,255,0.18)" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-normal">MatriWatch</h1>
              <p className="text-xs font-medium text-white/75">My Care Plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Care</p>
          {NAV.map((link) => {
            const isActive = link.href === "/mother" ? pathname === "/mother" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => { if (!isActive) playTap(); }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? "bg-white text-primary" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                data-testid={`nav-mother-${link.label.toLowerCase().replace(/ /g, "-")}`}
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
              <p className="truncate text-xs text-white/70">Mother</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            data-testid="button-signout"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" fill="currentColor" />
            <span className="font-semibold">{title ?? "MatriWatch"}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            data-testid="button-signout-mobile"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <main className="min-h-screen bg-[#FFF8F0] pb-20 lg:pb-0">
          <div className="mx-auto max-w-2xl">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border bg-white lg:hidden">
          {NAV.map((link) => {
            const isActive = link.href === "/mother" ? pathname === "/mother" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => { if (!isActive) playTap(); }}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
                data-testid={`nav-mother-mobile-${link.label.toLowerCase().replace(/ /g, "-")}`}
              >
                <link.icon className="h-5 w-5" style={{ color: isActive ? "#C97C8A" : "#AEAEB8" }} />
                <span className="text-xs font-medium" style={{ color: isActive ? "#C97C8A" : "#AEAEB8" }}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <MotherChatbot />
      </div>
    </div>
  );
}
