import { Link, useLocation } from "wouter";
import { Home, ClipboardList, Clock, LogOut, Heart } from "lucide-react";
import { clearAuth, getAuth } from "@/lib/auth";
import { playTap, playNavSwipe } from "@/lib/sounds";

interface MotherLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const NAV = [
  { href: "/mother/home", label: "Home", icon: Home },
  { href: "/mother/checkin", label: "Check In", icon: ClipboardList },
  { href: "/mother/history", label: "History", icon: Clock },
];

export function MotherLayout({ children, title }: MotherLayoutProps) {
  const [location, setLocation] = useLocation();
  const user = getAuth();

  function handleSignOut() {
    clearAuth();
    setLocation("/login");
  }

  return (
    /*
     * On desktop: show a centred phone-frame so staff can demo the mother view.
     * On mobile: full-screen native feel.
     */
    <div
      className="min-h-screen flex items-start justify-center"
      style={{ backgroundColor: "#E8DDD8" }}
    >
      <div
        className="relative flex flex-col bg-white overflow-hidden"
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100svh",
          /* Subtle phone shadow on desktop */
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Android status bar strip */}
        <div style={{ height: 28, backgroundColor: "#B56878", flexShrink: 0 }} />

        {/* App toolbar */}
        <header
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ backgroundColor: "#C97C8A" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
            >
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                {title ?? "MatriWatch"}
              </p>
              {user?.name && !title && (
                <p className="text-white/70 leading-tight" style={{ fontSize: 11 }}>
                  {user.name.split(" ")[0]}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            data-testid="button-signout"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </header>

        {/* Scrollable content — bottom-nav clearance */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: "#FFF8F0", paddingBottom: 72 }}
        >
          {children}
        </main>

        {/* Bottom navigation — Android material style */}
        <nav
          className="absolute bottom-0 left-0 right-0 flex items-stretch"
          style={{
            height: 64,
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #EDE8E3",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.07)",
          }}
        >
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative"
                onClick={() => { if (!active) { playTap(); playNavSwipe(); } }}
                data-testid={`nav-mother-${label.toLowerCase().replace(/ /g, "-")}`}
              >
                {/* Active indicator pill behind icon */}
                {active && (
                  <span
                    className="absolute top-2 rounded-full"
                    style={{
                      width: 56, height: 28,
                      backgroundColor: "#FCE8EE",
                      left: "50%", transform: "translateX(-50%)",
                    }}
                  />
                )}
                <Icon
                  className="w-5 h-5 relative z-10"
                  style={{ color: active ? "#C97C8A" : "#AEAEB8" }}
                />
                <span
                  className="text-xs font-medium relative z-10"
                  style={{ color: active ? "#C97C8A" : "#AEAEB8" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
