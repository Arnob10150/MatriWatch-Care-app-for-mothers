import { BrainCircuit, HeartPulse, LineChart, ShieldAlert } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ClinicShell } from "@/components/layout/clinic-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <ClinicShell>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Reports</h1>
            <p className="mt-1 text-sm text-muted-foreground">Population-level maternal health and model readiness.</p>
          </div>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="High-risk trend" value="3" detail="Flagged this week" tone="rose" icon={<ShieldAlert className="h-5 w-5" />} />
            <MetricCard label="EPDS follow-ups" value="2" detail="Scores 10 or above" tone="pink" icon={<HeartPulse className="h-5 w-5" />} />
            <MetricCard label="AI models" value="5" detail="Ready with fallback scoring" tone="sage" icon={<BrainCircuit className="h-5 w-5" />} />
          </section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LineChart className="h-4 w-4 text-primary" /> Risk Trend</CardTitle>
              <CardDescription>Demo trend chart used by the clinic dashboard and BEAR Summit walkthrough.</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart />
            </CardContent>
          </Card>
        </div>
      </main>
    </ClinicShell>
  );
}
