import { getAlerts } from "@/lib/api";
import { AlertsList } from "@/components/dashboard/alerts-list";
import { ClinicShell } from "@/components/layout/clinic-shell";

export default async function AlertsPage() {
  const { alerts } = await getAlerts();

  return (
    <ClinicShell>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Alerts</h1>
            <p className="mt-1 text-sm text-muted-foreground">Newest high-risk and EPDS events stay visible until handled.</p>
          </div>

          <AlertsList alerts={alerts} />
        </div>
      </main>
    </ClinicShell>
  );
}
