import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, HeartPulse, UserRound } from "lucide-react";
import Link from "next/link";
import { getPatientById } from "@/lib/api";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ClinicShell } from "@/components/layout/clinic-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = await getPatientById(params.id);

  if (!patient) {
    notFound();
  }

  return (
    <ClinicShell>
      <main className="min-h-screen">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#2D2D2D]">{patient.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {patient.age} years old, {patient.gestationalAgeWeeks} weeks pregnant
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Assigned clinic: {patient.clinicId}</p>
              </div>
              <RiskBadge level={patient.risk.level} />
            </div>
          </div>

          <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle>Vitals Over Time</CardTitle>
                <CardDescription>Dusty rose indicates recent risk trend movement.</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart />
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ["BP", `${patient.latestCheckIn.bpSystolic}/${patient.latestCheckIn.bpDiastolic}`, "mmHg"],
                ["Blood sugar", `${patient.latestCheckIn.bloodSugar}`, "mmol/L"],
                ["Temp", `${patient.latestCheckIn.bodyTemp}`, "C"],
                ["Heart rate", `${patient.latestCheckIn.heartRate}`, "bpm"],
              ].map(([label, value, unit]) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-[#2D2D2D]">{value}</p>
                    <p className="text-xs text-muted-foreground">{unit}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-primary" />
                Latest Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-sm text-muted-foreground">
              <p>BP: {patient.latestCheckIn.bpSystolic}/{patient.latestCheckIn.bpDiastolic} mmHg</p>
              <p>Blood sugar: {patient.latestCheckIn.bloodSugar} mg/dL</p>
              <p>Temp: {patient.latestCheckIn.bodyTemp} C</p>
              <p>Heart rate: {patient.latestCheckIn.heartRate} bpm</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                Care Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Assigned worker: {patient.assignedWorker}</p>
              <p>Clinic: {patient.clinicId}</p>
              <p>Last seen: {new Date(patient.lastSeenAt).toLocaleString("en-BD")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Pregnancy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Due date: {patient.dueDate}</p>
              <p>Gestational age: {patient.gestationalAgeWeeks} weeks</p>
              <p>EPDS: {patient.epds?.totalScore ?? "Pending"}</p>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-[#f3ecf9]">
          <CardHeader>
            <CardTitle>EPDS and Risk Explanation</CardTitle>
            <CardDescription>Mental health flagging and AI/rule fallback reasons.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/70 p-3">
              <span className="text-sm font-medium">Latest EPDS score</span>
              <Badge tone={patient.epds?.flagged ? "high" : "low"}>{patient.epds?.totalScore ?? "Pending"}</Badge>
            </div>
            {patient.risk.reasons.map((reason) => (
              <div key={reason} className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm">{reason}</span>
                <Badge tone={patient.risk.level === "High" ? "high" : "info"}>{patient.risk.score}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        </div>
      </main>
    </ClinicShell>
  );
}
