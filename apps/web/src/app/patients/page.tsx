import { patientSummaries } from "@matriwatch/shared";
import { PatientTable } from "@/components/dashboard/patient-table";
import { ClinicShell } from "@/components/layout/clinic-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PatientsPage() {
  return (
    <ClinicShell>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Patients</h1>
            <p className="mt-1 text-sm text-muted-foreground">All registered mothers assigned to this clinic.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
              <CardDescription>Open a patient to review vitals, EPDS status, and AI risk explanation.</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientTable patients={patientSummaries} />
            </CardContent>
          </Card>
        </div>
      </main>
    </ClinicShell>
  );
}
