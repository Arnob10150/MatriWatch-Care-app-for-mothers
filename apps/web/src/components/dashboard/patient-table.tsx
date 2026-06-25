import Link from "next/link";
import type { PatientSummary } from "@matriwatch/shared";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PatientTable({ patients }: { patients: PatientSummary[] }) {
  return (
    <Table>
      <TableHeader>
          <TableRow>
            <TableHead>Mother</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Vitals</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead>Gestational Age</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow
            key={patient.id}
            className={`hover:bg-[#FFF4F6] ${patient.risk.level === "High" ? "border-l-[3px] border-l-[#C94F6D]" : ""}`}
          >
            <TableCell>
              <span className="font-semibold text-foreground">{patient.name}</span>
              <div className="text-xs text-muted-foreground">{patient.assignedWorker}</div>
            </TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {patient.latestCheckIn.bpSystolic}/{patient.latestCheckIn.bpDiastolic} mmHg
              <br />
              {patient.latestCheckIn.bloodSugar} mmol/L, {patient.latestCheckIn.heartRate} bpm
            </TableCell>
            <TableCell>
              <RiskBadge level={patient.risk.level} />
            </TableCell>
            <TableCell>
              {new Date(patient.lastSeenAt).toLocaleString("en-BD", {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </TableCell>
            <TableCell>{patient.gestationalAgeWeeks} weeks</TableCell>
            <TableCell className="text-right">
              <Link
                href={`/patients/${patient.id}`}
                className="inline-flex h-8 items-center justify-center rounded-xl border border-[#C97C8A] px-3 text-xs font-medium text-[#C97C8A] transition-colors hover:bg-[#C97C8A] hover:text-white"
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
