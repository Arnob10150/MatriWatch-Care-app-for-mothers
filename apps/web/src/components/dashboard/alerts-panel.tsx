"use client";

import { useState } from "react";
import type { Alert } from "@matriwatch/shared";
import { markAlertRead } from "@/lib/api";
import { RiskBadge } from "@/components/dashboard/risk-badge";

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  async function handleMarkRead(id: string) {
    setReadIds((prev) => new Set(prev).add(id));
    await markAlertRead(id);
  }

  const visible = alerts.filter((alert) => !alert.isRead && !readIds.has(alert.id));

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">No active alerts.</p>;
  }

  return (
    <div className="space-y-3">
      {visible.map((alert) => (
        <div
          key={alert.id}
          className="rounded-2xl border border-[#f4c5d0] border-l-[3px] border-l-[#C94F6D] bg-[#FCE8EE] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">{alert.message}</p>
            <RiskBadge level={alert.riskLevel} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              {new Date(alert.createdAt).toLocaleString("en-BD", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <button
              type="button"
              onClick={() => handleMarkRead(alert.id)}
              className="text-xs font-medium text-[#C97C8A] hover:underline"
            >
              Mark as read
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
