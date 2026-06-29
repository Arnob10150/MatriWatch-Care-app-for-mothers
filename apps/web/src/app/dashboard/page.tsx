import {
  BellRing,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  HeartPulse,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";
import { clinics } from "@matriwatch/shared";
import { getAlerts, getDashboardStats, getPatientSummaries } from "@/lib/api";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PatientTable } from "@/components/dashboard/patient-table";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ClinicShell } from "@/components/layout/clinic-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modelRows = [
  ["Maternal risk classifier", "91.6% acc", "low"],
  ["Fetal CTG classifier", "93.2% acc", "low"],
  ["High-risk pregnancy model", "93.5% acc", "low"],
  ["GDM detector", "94.3% acc", "low"],
  ["Symptom triage", "95.4-100% acc", "info"],
  ["Realtime alert channel", "ready", "mid"],
] as const;

export default async function DashboardPage() {
  const [{ patients }, { alerts }, { stats }] = await Promise.all([
    getPatientSummaries(),
    getAlerts(),
    getDashboardStats(),
  ]);

  const highRisk = stats?.high_risk_count ?? patients.filter((patient) => patient.risk.level === "High").length;
  const checkinsToday = stats?.checkins_today ?? 0;
  const alertsToday = stats?.alerts_today ?? alerts.length;
  const totalPatients = stats?.total_patients ?? patients.length;

  return (
    <ClinicShell>
      <main className="min-h-screen">
        <div className="border-b border-border bg-white px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D2D2D]">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Caring for every mother, every day</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="icon" aria-label="Notifications">
                <BellRing className="h-4 w-4" />
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9B8C4] text-sm font-bold text-white">
                DA
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-2xl bg-white p-5 motherly-card-shadow">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4F6] text-primary">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2D2D2D]">Dhaka North Maternal Clinic</h2>
                  <p className="text-sm text-muted-foreground">Real-time maternal risk queue and AI triage summary.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info" className="h-8">{clinics.length} clinics</Badge>
                <Badge tone="high" className="h-8">
                  <CalendarClock className="mr-1 h-3.5 w-3.5" />
                  Live updates
                </Badge>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Patients"
              value={`${totalPatients}`}
              detail="Registered in this clinic"
              tone="pink"
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              label="High Risk"
              value={`${highRisk}`}
              detail="Needs same-day review"
              tone="rose"
              icon={<ShieldAlert className="h-5 w-5" />}
            />
            <MetricCard
              label="Alerts Today"
              value={`${alertsToday}`}
              detail="Unread and active events"
              tone="peach"
              icon={<BellRing className="h-5 w-5" />}
            />
            <MetricCard
              label="Check-ins Today"
              value={`${checkinsToday}`}
              detail="Mother-submitted vitals"
              tone="sage"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Patient Overview</CardTitle>
                  <CardDescription>Risk badges, last check-in, gestational age, and quick access.</CardDescription>
                </div>
                <Badge tone="high" className="h-7 w-fit">Priority queue</Badge>
              </CardHeader>
              <CardContent>
                <PatientTable patients={patients} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instant Alerts</CardTitle>
                <CardDescription>High-risk vitals and EPDS flags for nurse follow-up.</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertsPanel alerts={alerts} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <Card>
              <CardHeader>
                <CardTitle>Risk Trend</CardTitle>
                <CardDescription>Mid and high risk movement across the last seven days.</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  AI Readiness
                </CardTitle>
                <CardDescription>FastAPI model artifacts with local rule fallback.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {modelRows.map(([label, value, tone]) => (
                  <div key={label} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                    <span>{label}</span>
                    <Badge tone={tone}>{value}</Badge>
                  </div>
                ))}
                <div className="rounded-2xl bg-[#f3ecf9] p-3 text-xs leading-5 text-[#7A5A92]">
                  Mobile submissions call the AI endpoint first, then fall back to the shared rule engine for offline demos.
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </ClinicShell>
  );
}
