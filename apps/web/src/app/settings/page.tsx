import { ClinicShell } from "@/components/layout/clinic-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <ClinicShell>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Clinic profile and alert preferences.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Clinic Alert Rules</CardTitle>
              <CardDescription>High-risk vitals and EPDS flags are sent to the clinic dashboard automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {["High BP alert", "High blood sugar alert", "Fever alert", "EPDS score 10+ alert"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
                  <span className="text-sm font-medium text-[#2D2D2D]">{item}</span>
                  <span className="rounded-full bg-[#F0F7ED] px-3 py-1 text-xs font-semibold text-[#87A878]">Enabled</span>
                </div>
              ))}
              <Button className="w-full">Save Settings</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </ClinicShell>
  );
}
