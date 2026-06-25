import { alerts } from "@matriwatch/shared";
import { RiskBadge } from "@/components/dashboard/risk-badge";

export function AlertsPanel() {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="rounded-2xl border border-[#f4c5d0] border-l-[3px] border-l-[#C94F6D] bg-[#FCE8EE] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">{alert.message}</p>
            <RiskBadge level={alert.riskLevel} />
          </div>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {new Date(alert.createdAt).toLocaleString("en-BD", {
              dateStyle: "medium",
              timeStyle: "short"
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
