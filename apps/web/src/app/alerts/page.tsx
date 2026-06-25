import { alerts } from "@matriwatch/shared";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { ClinicShell } from "@/components/layout/clinic-shell";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {
  return (
    <ClinicShell>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Alerts</h1>
            <p className="mt-1 text-sm text-muted-foreground">Newest high-risk and EPDS events stay visible until handled.</p>
          </div>

          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <article
                key={alert.id}
                className={`rounded-2xl border p-5 motherly-card-shadow ${
                  index < 3
                    ? "border-[#f4c5d0] border-l-[3px] border-l-[#C94F6D] bg-[#FCE8EE]"
                    : "border-border bg-white text-muted-foreground"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-semibold capitalize text-[#2D2D2D]">{alert.type.replaceAll("_", " ")}</span>
                      <RiskBadge level={alert.riskLevel} />
                    </div>
                    <p className="text-sm leading-6">{alert.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">Mark as Read</Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </ClinicShell>
  );
}
