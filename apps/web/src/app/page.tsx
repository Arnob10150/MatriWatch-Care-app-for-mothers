import Link from "next/link";
import {
  Heart,
  Activity,
  ShieldCheck,
  Smartphone,
  Globe,
  AlertTriangle,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";

export const metadata = {
  title: "MatriWatch — AI-Powered Maternal Health Monitoring",
  description:
    "Empowering clinics and community health workers worldwide to monitor maternal health, screen for postnatal depression, and prevent maternal mortality.",
};

const STATS = [
  { value: "295,000+", label: "Maternal deaths per year", sub: "globally (WHO, 2023)" },
  { value: "94%", label: "Deaths in low-income countries", sub: "preventable with monitoring" },
  { value: "4 Roles", label: "Admin · Doctor · Nurse · Mother", sub: "role-based clinic access" },
  { value: "190+", label: "Countries need solutions", sub: "MatriWatch scales globally" },
];

const FEATURES = [
  {
    icon: Activity,
    color: "#C97C8A",
    bg: "#FCE8EE",
    title: "Real-Time Vital Monitoring",
    desc: "Daily check-ins capture blood pressure, heart rate, weight, and temperature. Automated alerts fire when readings cross clinical thresholds.",
  },
  {
    icon: Heart,
    color: "#C94F6D",
    bg: "#FCE8EE",
    title: "EPDS Mental Health Screening",
    desc: "Integrated Edinburgh Postnatal Depression Scale screens every mother after delivery. AI scoring flags high-risk cases for immediate clinical review.",
  },
  {
    icon: AlertTriangle,
    color: "#7A5A92",
    bg: "#F3ECF9",
    title: "AI Risk Detection & Alerts",
    desc: "Machine-learning risk engine analyses vitals trends and EPDS scores to predict complications before they become emergencies.",
  },
  {
    icon: Users,
    color: "#87A878",
    bg: "#F0F7ED",
    title: "Multi-Role Clinic Management",
    desc: "Admins manage staff rosters; doctors review patient records; nurses conduct check-ins; mothers track their own health journey — all in one platform.",
  },
  {
    icon: Smartphone,
    color: "#C97C8A",
    bg: "#FCE8EE",
    title: "Mobile-First for All Devices",
    desc: "Native iOS and Android app via Expo Go. Works on low-cost Android phones so community health workers in rural areas are never left behind.",
  },
  {
    icon: ShieldCheck,
    color: "#7A5A92",
    bg: "#F3ECF9",
    title: "Local-First Data Privacy",
    desc: "All patient data stays on your clinic's local server — no cloud uploads, no third-party exposure. Full GDPR & DGHS compliance built in.",
  },
];

const PREGNANCY_STAGES = [
  {
    stage: "Prenatal",
    weeks: "Week 1–40",
    color: "#87A878",
    border: "#87A87830",
    checks: ["Blood pressure & weight", "Foetal movement tracking", "Anaemia screening", "Risk score update"],
  },
  {
    stage: "Labour & Delivery",
    weeks: "Birth Event",
    color: "#C97C8A",
    border: "#C97C8A30",
    checks: ["Delivery mode recorded", "APGAR score logging", "Immediate vitals alert", "Nurse notification"],
  },
  {
    stage: "Postnatal",
    weeks: "Week 1–6",
    color: "#C94F6D",
    border: "#C94F6D30",
    checks: ["Daily vitals check-in", "EPDS depression screen", "Breastfeeding support", "Mental health flag"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#FFF8F0", color: "#2D2D2D" }}>

      {/* ── Navbar ── */}
      <LandingNavbar />

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 px-4 relative overflow-hidden" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ backgroundColor: "#FCE8EE" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: "#F3ECF9" }} />
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Two-column layout on desktop */}
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left: text */}
            <div className="flex-1 text-center lg:text-left">
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
                style={{ backgroundColor: "#FCE8EE", color: "#C94F6D" }}
              >
                <Globe className="w-3.5 h-3.5" />
                Built for the world — deployed locally
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6" style={{ color: "#2D2D2D" }}>
                AI-Powered Maternal Health{" "}
                <span style={{ color: "#C97C8A" }}>Monitoring</span>
                {" "}for Every Mother, Everywhere
              </h1>

              <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: "#7A7A8A" }}>
                MatriWatch connects clinics, doctors, nurses, and mothers in one unified platform.
                Track pregnancies, screen for postnatal depression, and receive AI-driven risk
                alerts — all on <strong style={{ color: "#2D2D2D" }}>your local server</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-base font-semibold rounded-xl transition-colors"
                  style={{ backgroundColor: "#C97C8A", boxShadow: "0 4px 14px rgba(201,124,138,0.30)" }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl border transition-colors"
                  style={{ borderColor: "#EDE8E3", color: "#7A7A8A", backgroundColor: "white" }}
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right: illustration */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <svg viewBox="0 0 420 380" className="w-full max-w-md" aria-hidden>
                {/* Background circle */}
                <circle cx="210" cy="190" r="170" fill="#FCE8EE" opacity="0.5" />

                {/* Mother figure — body */}
                <ellipse cx="210" cy="290" rx="62" ry="28" fill="#F9D5E0" />
                <rect x="170" y="220" width="80" height="80" rx="20" fill="#F4A7BC" />

                {/* Baby bump */}
                <ellipse cx="210" cy="265" rx="34" ry="30" fill="#F9C5D5" />

                {/* Mother figure — head */}
                <circle cx="210" cy="190" r="38" fill="#F4A7BC" />
                {/* Hair */}
                <ellipse cx="210" cy="170" rx="38" ry="18" fill="#C97C8A" />
                <ellipse cx="183" cy="192" rx="10" ry="22" fill="#C97C8A" />
                <ellipse cx="237" cy="192" rx="10" ry="22" fill="#C97C8A" />

                {/* Face — eyes */}
                <circle cx="198" cy="190" r="4" fill="#7A3A50" />
                <circle cx="222" cy="190" r="4" fill="#7A3A50" />
                <circle cx="199.5" cy="188.5" r="1.5" fill="white" />
                <circle cx="223.5" cy="188.5" r="1.5" fill="white" />
                {/* Smile */}
                <path d="M 200 202 Q 210 210 220 202" stroke="#7A3A50" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Arms */}
                <ellipse cx="155" cy="250" rx="12" ry="34" fill="#F4A7BC" transform="rotate(-15,155,250)" />
                <ellipse cx="265" cy="250" rx="12" ry="34" fill="#F4A7BC" transform="rotate(15,265,250)" />

                {/* Heartbeat monitor — top right */}
                <rect x="285" y="80" width="110" height="70" rx="12" fill="white" stroke="#EDE8E3" strokeWidth="1.5" />
                <text x="295" y="100" fontSize="9" fill="#7A7A8A" fontFamily="sans-serif">Heart Rate</text>
                <text x="295" y="118" fontSize="18" fontWeight="bold" fill="#C94F6D" fontFamily="sans-serif">84 bpm</text>
                <polyline points="295,140 305,140 310,125 316,152 322,130 328,140 345,140" fill="none" stroke="#C94F6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* BP card — top left */}
                <rect x="25" y="80" width="110" height="70" rx="12" fill="white" stroke="#EDE8E3" strokeWidth="1.5" />
                <text x="35" y="100" fontSize="9" fill="#7A7A8A" fontFamily="sans-serif">Blood Pressure</text>
                <text x="35" y="118" fontSize="18" fontWeight="bold" fill="#87A878" fontFamily="sans-serif">118/76</text>
                <text x="35" y="138" fontSize="8" fill="#87A878" fontFamily="sans-serif">✓ Normal</text>

                {/* Week badge — bottom left */}
                <rect x="30" y="290" width="95" height="55" rx="12" fill="white" stroke="#EDE8E3" strokeWidth="1.5" />
                <text x="45" y="310" fontSize="8" fill="#7A7A8A" fontFamily="sans-serif">Gestational</text>
                <text x="45" y="325" fontSize="8" fill="#7A7A8A" fontFamily="sans-serif">Age</text>
                <text x="45" y="340" fontSize="16" fontWeight="bold" fill="#C97C8A" fontFamily="sans-serif">32 wks</text>

                {/* EPDS badge — bottom right */}
                <rect x="295" y="290" width="100" height="55" rx="12" fill="white" stroke="#EDE8E3" strokeWidth="1.5" />
                <text x="308" y="310" fontSize="8" fill="#7A7A8A" fontFamily="sans-serif">EPDS Score</text>
                <text x="308" y="332" fontSize="20" fontWeight="bold" fill="#7A5A92" fontFamily="sans-serif">4 / 30</text>
                <text x="308" y="345" fontSize="8" fill="#87A878" fontFamily="sans-serif">✓ Low risk</text>

                {/* Floating heart */}
                <path d="M 210 60 C 210 60 196 48 188 54 C 180 60 180 72 188 78 L 210 96 L 232 78 C 240 72 240 60 232 54 C 224 48 210 60 210 60Z" fill="#C97C8A" opacity="0.85" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hero dashboard mockup */}
        <div className="relative max-w-4xl mx-auto mt-16 px-4">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(201,124,138,0.15)", border: "1px solid #EDE8E3" }}>
            <div className="px-6 py-3 flex items-center gap-2" style={{ backgroundColor: "#C97C8A" }}>
              <div className="w-3 h-3 rounded-full bg-white opacity-60" />
              <div className="w-3 h-3 rounded-full bg-white opacity-40" />
              <div className="w-3 h-3 rounded-full bg-white opacity-30" />
              <span className="ml-3 text-white text-sm font-medium opacity-90">MatriWatch Dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Patients", value: "1,248", color: "#C97C8A", bg: "#FCE8EE" },
                { label: "High Risk", value: "23", color: "#C94F6D", bg: "#FCE8EE" },
                { label: "Screened Today", value: "47", color: "#7A5A92", bg: "#F3ECF9" },
                { label: "Active Nurses", value: "12", color: "#87A878", bg: "#F0F7ED" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: item.bg }}>
                  <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs mt-1 font-medium" style={{ color: "#7A7A8A" }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-lg px-4 py-3 flex items-start gap-3" style={{ backgroundColor: "#FFF3F6", border: "1px solid #F9B8C4" }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#C94F6D" }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#C94F6D" }}>High-Risk Alert — Patient #MW-0847</p>
                  <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>Blood pressure 145/95 mmHg · EPDS score 14 · Assigned to Dr Aisha Rahman</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Global Stats ── */}
      <section className="py-16" style={{ backgroundColor: "#2D2D2D" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold mb-1" style={{ color: "#F9B8C4" }}>{s.value}</div>
                <div className="text-sm font-semibold text-white mb-0.5">{s.label}</div>
                <div className="text-xs" style={{ color: "#AEAEB8" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pregnancy Journey ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-14">
            {/* Illustration */}
            <div className="flex-shrink-0 flex justify-center">
              <svg viewBox="0 0 300 280" className="w-64 lg:w-72" aria-hidden>
                <circle cx="150" cy="140" r="120" fill="#FFF8F0" />
                {/* Timeline spine */}
                <line x1="150" y1="40" x2="150" y2="240" stroke="#EDE8E3" strokeWidth="3" strokeDasharray="6,4" />
                {/* Phase 1 — Prenatal */}
                <circle cx="150" cy="60" r="22" fill="#87A878" />
                <text x="150" y="65" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="sans-serif">P1</text>
                <rect x="176" y="44" width="100" height="32" rx="8" fill="#F0F7ED" />
                <text x="183" y="58" fontSize="9" fill="#87A878" fontWeight="bold" fontFamily="sans-serif">Prenatal</text>
                <text x="183" y="70" fontSize="8" fill="#7A7A8A" fontFamily="sans-serif">Weeks 1–40</text>
                {/* Phase 2 — Labour */}
                <circle cx="150" cy="140" r="22" fill="#C97C8A" />
                <text x="150" y="145" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="sans-serif">P2</text>
                <rect x="176" y="124" width="100" height="32" rx="8" fill="#FCE8EE" />
                <text x="183" y="138" fontSize="9" fill="#C97C8A" fontWeight="bold" fontFamily="sans-serif">Labour</text>
                <text x="183" y="150" fontSize="8" fill="#7A7A8A" fontFamily="sans-serif">Birth event</text>
                {/* Phase 3 — Postnatal */}
                <circle cx="150" cy="220" r="22" fill="#C94F6D" />
                <text x="150" y="225" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="sans-serif">P3</text>
                <rect x="176" y="204" width="100" height="32" rx="8" fill="#FFF3F6" />
                <text x="183" y="218" fontSize="9" fill="#C94F6D" fontWeight="bold" fontFamily="sans-serif">Postnatal</text>
                <text x="183" y="230" fontSize="8" fill="#7A7A8A" fontFamily="sans-serif">Weeks 1–6</text>
                {/* Heart at top */}
                <path d="M 150 22 C 150 22 141 15 136 18 C 131 21 131 27 136 31 L 150 42 L 164 31 C 169 27 169 21 164 18 C 159 15 150 22 150 22Z" fill="#C97C8A" opacity="0.7" />
              </svg>
            </div>
            {/* Text */}
            <div>
              <div
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
                style={{ backgroundColor: "#FCE8EE", color: "#C94F6D" }}
              >
                Pregnancy Journey
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "#2D2D2D" }}>
                Complete Care Across Every Stage
              </h2>
              <p className="text-lg max-w-xl" style={{ color: "#7A7A8A" }}>
                From the first prenatal visit to six weeks postnatal — MatriWatch is the single thread
                connecting mother and clinic throughout the entire journey.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PREGNANCY_STAGES.map((stage) => (
              <div
                key={stage.stage}
                className="relative rounded-2xl border-2 p-6 bg-white hover:shadow-md transition-shadow"
                style={{ borderColor: stage.border }}
              >
                <div
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-1"
                  style={{ backgroundColor: stage.color + "18", color: stage.color }}
                >
                  {stage.weeks}
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: stage.color }}>
                  {stage.stage}
                </h3>
                <ul className="space-y-2">
                  {stage.checks.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm" style={{ color: "#7A7A8A" }}>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: stage.color }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div
              className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
              style={{ backgroundColor: "#FCE8EE", color: "#C97C8A" }}
            >
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "#2D2D2D" }}>
              Everything a Clinic Needs
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#7A7A8A" }}>
              Purpose-built for maternal health — not adapted from generic software.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-6 border hover:shadow-md transition-shadow"
                  style={{ borderColor: "#EDE8E3", boxShadow: "0 2px 8px rgba(201,124,138,0.06)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: f.bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold mb-2 text-base" style={{ color: "#2D2D2D" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#7A7A8A" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Global Reach CTA ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
            style={{ backgroundColor: "#C97C8A" }}
          >
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full opacity-5 translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative">
              {/* World dots illustration */}
              <svg viewBox="0 0 400 160" className="w-full max-w-md mx-auto mb-6 opacity-30" aria-hidden>
                {[
                  [40,60],[60,40],[80,55],[100,45],[120,60],[140,50],[160,65],[180,55],[200,60],[220,50],[240,60],[260,55],[280,65],[300,50],[320,60],[340,55],[360,65],
                  [50,80],[70,90],[90,75],[110,85],[130,75],[150,85],[170,80],[190,90],[210,80],[230,85],[250,75],[270,85],[290,75],[310,85],[330,80],[350,75],
                  [45,105],[65,110],[85,100],[105,110],[125,100],[145,108],[165,100],[185,110],[205,100],[225,110],[245,100],[265,108],[285,100],[305,110],[325,100],[345,108],
                  [55,125],[75,130],[95,120],[115,128],[135,120],[155,130],[175,120],[195,128],[215,120],[235,128],[255,120],[275,128],[295,120],[315,128],[335,120],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="white" />
                ))}
                {/* Highlight dots for key countries */}
                {[[80,55],[200,60],[310,85],[150,85],[260,55]].map(([x, y], i) => (
                  <circle key={`h${i}`} cx={x} cy={y} r="6" fill="white" opacity="0.8" />
                ))}
              </svg>
              <Globe className="w-12 h-12 mx-auto mb-6 text-white opacity-90" />
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Designed for the Whole World
              </h2>
              <p className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: "#FCE8EE" }}>
                From rural Bangladesh to urban clinics in Sub-Saharan Africa — MatriWatch is built
                to work on low-cost hardware, over slow internet, with local languages. No cloud
                subscription. No ongoing fees. Deploy it on any server, anywhere.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
                {[
                  { icon: BarChart3, label: "Bangla + Multi-language (Pilot Q3 2026)" },
                  { icon: Smartphone, label: "Works on 3,000 Android phones" },
                  { icon: ShieldCheck, label: "DGHS & WHO guideline-aligned" },
                ].map((item) => {
                  const I = item.icon;
                  return (
                    <div key={item.label} className="text-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "rgba(255,255,255,0.20)" }}>
                        <I className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs leading-snug" style={{ color: "#FCE8EE" }}>{item.label}</p>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
                style={{ backgroundColor: "white", color: "#C97C8A", boxShadow: "0 4px 14px rgba(0,0,0,0.10)" }}
              >
                Start Using MatriWatch <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-4" style={{ backgroundColor: "#2D2D2D" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FCE8EE" }}>
                <Heart className="w-4 h-4" style={{ color: "#C97C8A", fill: "#C97C8A" }} />
              </div>
              <div>
                <span className="font-bold text-sm" style={{ color: "#F9B8C4" }}>MatriWatch</span>
                <p className="text-xs leading-none mt-0.5" style={{ color: "#7A7A8A" }}>AI Maternal Health Platform</p>
              </div>
            </div>

            <p className="text-xs text-center sm:text-right" style={{ color: "#7A7A8A" }}>
              © 2026 MatriWatch. Built to save mothers&apos; lives worldwide.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
