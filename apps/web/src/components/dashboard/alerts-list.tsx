"use client";

import { useState } from "react";
import type { Alert } from "@matriwatch/shared";
import { markAlertRead } from "@/lib/api";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { Button } from "@/components/ui/button";

export function AlertsList({ alerts }: { alerts: Alert[] }) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleMarkRead(id: string) {
    setPendingId(id);
    await markAlertRead(id);
    setReadIds((prev) => new Set(prev).add(id));
    setPendingId(null);
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => {
        const isRead = alert.isRead || readIds.has(alert.id);
        return (
          <article
            key={alert.id}
            className={`rounded-2xl border p-5 motherly-card-shadow ${
              !isRead && index < 3
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
              <Button
                variant="secondary"
                size="sm"
                disabled={isRead || pendingId === alert.id}
                onClick={() => handleMarkRead(alert.id)}
              >
                {isRead ? "Read" : pendingId === alert.id ? "Marking…" : "Mark as Read"}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
