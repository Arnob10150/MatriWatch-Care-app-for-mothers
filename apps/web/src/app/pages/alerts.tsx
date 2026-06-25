import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListAlerts,
  useMarkAlertRead,
  useListMothers,
  getListAlertsQueryKey,
  getListMothersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { BellOff, UserX, PhoneCall, CheckCircle2 } from "lucide-react";
import { playResolved, playTap } from "@/lib/sounds";

const ALERT_TYPE_LABELS: Record<string, string> = {
  high_risk_vitals: "High Risk Vitals",
  ppd_risk: "PPD Risk",
  missed_checkin: "Missed Check-in",
  bp_elevated: "Elevated BP",
  temperature_high: "High Temperature",
};

const ALERT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  high_risk_vitals: { bg: "#FCE8EE", text: "#C94F6D" },
  ppd_risk:         { bg: "#F3EDF9", text: "#9B6DC5" },
  missed_checkin:   { bg: "#FDF3E7", text: "#D4914A" },
  bp_elevated:      { bg: "#FCE8EE", text: "#C94F6D" },
  temperature_high: { bg: "#FDF3E7", text: "#D4914A" },
};

type FilterTab = "unread" | "all";

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<FilterTab>("unread");

  const { data: alerts, isLoading: alertsLoading } = useListAlerts(
    {},
    { query: { queryKey: getListAlertsQueryKey({}) } }
  );
  const { data: mothers } = useListMothers(
    {},
    { query: { queryKey: getListMothersQueryKey({}) } }
  );
  const markRead = useMarkAlertRead();

  // Mothers with no check-in in 48+ hours
  const missedMothers = (mothers ?? []).filter(m => {
    if (!m.last_checkin_at) return true;
    return differenceInHours(new Date(), new Date(m.last_checkin_at)) >= 48;
  });

  function handleResolve(id: string) {
    playResolved();
    markRead.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey({}) });
          queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey({ is_read: false }) });
        },
      }
    );
  }

  const sorted = [...(alerts ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const displayed = tab === "unread" ? sorted.filter(a => !a.is_read) : sorted;
  const unreadCount = sorted.filter(a => !a.is_read).length;

  return (
    <Layout title="Alerts">
      <div className="max-w-3xl space-y-5">

        {/* Missed check-ins banner */}
        {missedMothers.length > 0 && (
          <div
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: "#FDF3E7", borderColor: "#F0CCA4" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#F0CCA4" }}
              >
                <UserX className="w-4 h-4" style={{ color: "#D4914A" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: "#D4914A" }}>
                  {missedMothers.length} patient{missedMothers.length > 1 ? "s" : ""} haven't checked in for 48+ hours
                </p>
                <div className="flex flex-wrap gap-2">
                  {missedMothers.map(m => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.7)", color: "#D4914A" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "#D4914A" }}
                      />
                      {m.name}
                      {m.last_checkin_at
                        ? ` · ${Math.floor(differenceInHours(new Date(), new Date(m.last_checkin_at)))}h ago`
                        : " · never"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ backgroundColor: "#FFF0E8" }}
        >
          {(["unread", "all"] as FilterTab[]).map(t => (
            <button
              key={t}
              onClick={() => { playTap(); setTab(t); }}
              className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t ? "#FFFFFF" : "transparent",
                color: tab === t ? "#C97C8A" : "#7A7A8A",
                boxShadow: tab === t ? "0 1px 3px rgba(201,124,138,0.1)" : "none",
              }}
            >
              {t === "unread" ? `Unread (${unreadCount})` : `All (${sorted.length})`}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {alertsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5"
                  style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
                >
                  <Skeleton className="h-4 w-48 mb-2" style={{ backgroundColor: "#FFF0E8" }} />
                  <Skeleton className="h-3 w-full mb-1" style={{ backgroundColor: "#FFF0E8" }} />
                  <Skeleton className="h-3 w-32" style={{ backgroundColor: "#FFF0E8" }} />
                </div>
              ))
            : displayed.map(alert => {
                const typeColors = ALERT_TYPE_COLORS[alert.alert_type] ?? { bg: "#F0F0F0", text: "#7A7A8A" };
                return (
                  <div
                    key={alert.id}
                    className="rounded-2xl p-5 transition-all"
                    style={{
                      backgroundColor: alert.is_read ? "#FFFFFF" : "#FCE8EE",
                      borderLeft: alert.is_read ? "3px solid #EDE8E3" : "3px solid #C94F6D",
                      boxShadow: "0 1px 4px rgba(201,124,138,0.08)",
                    }}
                    data-testid={`alert-card-${alert.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-semibold text-sm" style={{ color: "#2D2D2D" }}>
                            {(alert as { mother_name?: string | null }).mother_name ?? "Patient"}
                          </span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: typeColors.bg, color: typeColors.text }}
                          >
                            {ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type}
                          </span>
                          {!alert.is_read && (
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: "#C94F6D" }}
                            />
                          )}
                        </div>

                        {/* Message */}
                        <p
                          className="text-sm leading-snug"
                          style={{ color: alert.is_read ? "#7A7A8A" : "#2D2D2D" }}
                        >
                          {alert.message}
                        </p>

                        {/* Time + resolved indicator */}
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-xs" style={{ color: "#7A7A8A" }}>
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </p>
                          {alert.is_read && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: "#87A878" }}>
                              <CheckCircle2 className="w-3 h-3" />
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {!alert.is_read && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={markRead.isPending}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all disabled:opacity-60"
                            style={{ backgroundColor: "#F0F7ED", color: "#87A878" }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#DCF0D5")}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F0F7ED")}
                            data-testid={`button-resolve-${alert.id}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                          <button
                            onClick={() => playTap()}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all"
                            style={{ borderColor: "#C97C8A", color: "#C97C8A", backgroundColor: "transparent" }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FCE8EE")}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                            data-testid={`button-call-${alert.id}`}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            Call
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>

        {!alertsLoading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "#F0F7ED" }}
            >
              <BellOff className="w-6 h-6" style={{ color: "#87A878" }} />
            </div>
            <p className="font-medium" style={{ color: "#2D2D2D" }}>
              {tab === "unread" ? "All caught up" : "No alerts yet"}
            </p>
            <p className="text-sm mt-1" style={{ color: "#7A7A8A" }}>
              {tab === "unread"
                ? "No unresolved alerts. Great work."
                : "Alerts will appear here when patients submit high-risk check-ins."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
