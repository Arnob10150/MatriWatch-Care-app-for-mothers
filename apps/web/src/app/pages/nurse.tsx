import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListAlerts,
  useMarkAlertRead,
  useListMothers,
  useListEpdsForMother,
  getListAlertsQueryKey,
  getListMothersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import {
  BellOff, UserX, PhoneCall, CheckCircle2, Brain, AlertTriangle,
  ChevronRight, Users,
} from "lucide-react";
import { playResolved, playTap, playCallButton, playNewAlert } from "@/lib/sounds";

const ALERT_TYPE_LABELS: Record<string, string> = {
  high_risk_vitals: "High Risk Vitals",
  ppd_risk: "PPD Risk",
  missed_checkin: "Missed Check-in",
  bp_elevated: "Elevated BP",
  temperature_high: "High Temp",
};

const ALERT_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  high_risk_vitals: { bg: "#FCE8EE", text: "#C94F6D", dot: "#C94F6D" },
  ppd_risk:         { bg: "#F3EDF9", text: "#9B6DC5", dot: "#9B6DC5" },
  missed_checkin:   { bg: "#FDF3E7", text: "#D4914A", dot: "#D4914A" },
  bp_elevated:      { bg: "#FCE8EE", text: "#C94F6D", dot: "#C94F6D" },
  temperature_high: { bg: "#FDF3E7", text: "#D4914A", dot: "#D4914A" },
};

export default function NurseDashboard() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: alerts, isLoading: alertsLoading } = useListAlerts(
    {},
    { query: { queryKey: getListAlertsQueryKey({}) } }
  );
  const { data: mothers, isLoading: mothersLoading } = useListMothers(
    {},
    { query: { queryKey: getListMothersQueryKey({}) } }
  );
  const markRead = useMarkAlertRead();

  // Load EPDS for all mothers in parallel
  const motherIds = (mothers ?? []).map(m => m.id);
  const epdsResults = useQueries({
    queries: motherIds.map(id => ({
      queryKey: ["epds", id],
      queryFn: () =>
        fetch(`/api/mothers/${id}/epds`).then(r => r.json()) as Promise<
          { total_score: number; ppd_flagged: boolean; created_at: string }[]
        >,
      enabled: !!id,
    })),
  });

  const epdsFlags = motherIds
    .map((id, i) => {
      const latest = epdsResults[i]?.data?.[0];
      const mother = mothers?.find(m => m.id === id);
      if (!latest || latest.total_score < 10) return null;
      return { mother, score: latest.total_score, ppd: latest.ppd_flagged, date: latest.created_at };
    })
    .filter(Boolean);

  const missedMothers = (mothers ?? []).filter(m => {
    if (!m.last_checkin_at) return true;
    return differenceInHours(new Date(), new Date(m.last_checkin_at)) >= 48;
  });

  const sorted = [...(alerts ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const unread = sorted.filter(a => !a.is_read);
  const resolved = sorted.filter(a => a.is_read);

  function handleResolve(id: string) {
    playResolved();
    markRead.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey({}) });
        },
      }
    );
  }

  function handleCall() {
    playCallButton();
  }

  return (
    <Layout title="My Shift">
      <div className="grid grid-cols-12 gap-5">

        {/* LEFT: Unread alert queue — primary focus */}
        <div className="col-span-8 space-y-5">

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryChip
              count={unread.length}
              label="Unresolved alerts"
              icon={AlertTriangle}
              bg="#FCE8EE"
              color="#C94F6D"
              urgent={unread.length > 0}
            />
            <SummaryChip
              count={missedMothers.length}
              label="Overdue check-ins"
              icon={UserX}
              bg="#FDF3E7"
              color="#D4914A"
            />
            <SummaryChip
              count={epdsFlags.length}
              label="EPDS follow-ups"
              icon={Brain}
              bg="#F3EDF9"
              color="#9B6DC5"
            />
          </div>

          {/* Unread alert queue */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#FCE8EE" }}
              >
                <AlertTriangle className="w-4 h-4" style={{ color: "#C94F6D" }} />
              </div>
              <h2 className="text-base font-semibold" style={{ color: "#2D2D2D" }}>
                Needs attention
              </h2>
              {unread.length > 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#C94F6D", color: "white" }}
                >
                  {unread.length}
                </span>
              )}
            </div>

            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-28 rounded-2xl" style={{ backgroundColor: "#FFF0E8" }} />
                ))}
              </div>
            ) : unread.length === 0 ? (
              <div
                className="rounded-2xl p-10 flex flex-col items-center text-center"
                style={{ backgroundColor: "#F0F7ED", border: "1px solid #C6DFC0" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#C6DFC0" }}
                >
                  <BellOff className="w-5 h-5" style={{ color: "#87A878" }} />
                </div>
                <p className="font-semibold" style={{ color: "#87A878" }}>All caught up</p>
                <p className="text-sm mt-1" style={{ color: "#7A7A8A" }}>
                  No unresolved alerts right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unread.map(alert => {
                  const colors = ALERT_TYPE_COLORS[alert.alert_type] ?? { bg: "#F0F0F0", text: "#7A7A8A", dot: "#AEAEB8" };
                  const motherName = (alert as { mother_name?: string | null }).mother_name ?? "Patient";
                  return (
                    <div
                      key={alert.id}
                      className="bg-white rounded-2xl p-4"
                      style={{
                        borderLeft: `4px solid ${colors.dot}`,
                        boxShadow: "0 2px 8px rgba(201,79,109,0.10)",
                      }}
                      data-testid={`alert-card-${alert.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Dot */}
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: colors.dot }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-bold text-sm" style={{ color: "#2D2D2D" }}>
                              {motherName}
                            </span>
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              {ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type}
                            </span>
                          </div>
                          <p className="text-sm leading-snug mb-1.5" style={{ color: "#2D2D2D" }}>
                            {alert.message}
                          </p>
                          <p className="text-xs" style={{ color: "#7A7A8A" }}>
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleCall()}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all"
                            style={{ borderColor: "#C97C8A", color: "#C97C8A" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FCE8EE")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                            data-testid={`button-call-${alert.id}`}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            Call
                          </button>
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={markRead.isPending}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all"
                            style={{ backgroundColor: "#F0F7ED", color: "#87A878" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#DCF0D5")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#F0F7ED")}
                            data-testid={`button-resolve-${alert.id}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                          <button
                            onClick={() => {
                              playTap();
                              const m = mothers?.find(x => x.id === alert.mother_id);
                              if (m) setLocation(`/patients/${m.id}`);
                            }}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all"
                            style={{ borderColor: "#EDE8E3", color: "#7A7A8A" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F7F4F1")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recently resolved */}
          {resolved.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#7A7A8A" }}>
                Recently resolved
              </h3>
              <div className="space-y-2">
                {resolved.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    className="bg-white rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ opacity: 0.75, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#87A878" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: "#2D2D2D" }}>
                        <span className="font-medium">
                          {(alert as { mother_name?: string | null }).mother_name ?? "Patient"}
                        </span>
                        {" — "}
                        {alert.message}
                      </p>
                      <p className="text-xs" style={{ color: "#7A7A8A" }}>
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT: Side panels */}
        <div className="col-span-4 space-y-5">

          {/* Missed check-ins */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: "#FDF3E7", borderBottom: "1px solid #F0CCA4" }}
            >
              <UserX className="w-4 h-4" style={{ color: "#D4914A" }} />
              <p className="text-sm font-semibold" style={{ color: "#D4914A" }}>
                Overdue check-ins
              </p>
              <span
                className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "#D4914A", color: "white" }}
              >
                {missedMothers.length}
              </span>
            </div>

            {mothersLoading ? (
              <div className="p-4 space-y-2 bg-white">
                {[1, 2].map(i => <Skeleton key={i} className="h-10 rounded-xl" style={{ backgroundColor: "#FFF0E8" }} />)}
              </div>
            ) : missedMothers.length === 0 ? (
              <div className="bg-white px-4 py-6 text-center">
                <p className="text-sm" style={{ color: "#87A878" }}>All patients checked in recently</p>
              </div>
            ) : (
              <div className="bg-white divide-y" style={{ borderColor: "#EDE8E3" }}>
                {missedMothers.map(m => {
                  const hours = m.last_checkin_at
                    ? Math.floor(differenceInHours(new Date(), new Date(m.last_checkin_at)))
                    : null;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { playTap(); setLocation(`/patients/${m.id}`); }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ backgroundColor: "#FDF3E7", color: "#D4914A" }}
                      >
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#2D2D2D" }}>{m.name}</p>
                        <p className="text-xs" style={{ color: "#D4914A" }}>
                          {hours !== null ? `${hours}h overdue` : "Never checked in"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#AEAEB8" }} />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* EPDS flags */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: "#F3EDF9", borderBottom: "1px solid #D8C4E8" }}
            >
              <Brain className="w-4 h-4" style={{ color: "#9B6DC5" }} />
              <p className="text-sm font-semibold" style={{ color: "#9B6DC5" }}>
                EPDS follow-ups
              </p>
              <span
                className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "#9B6DC5", color: "white" }}
              >
                {epdsFlags.length}
              </span>
            </div>

            {epdsFlags.length === 0 ? (
              <div className="bg-white px-4 py-6 text-center">
                <p className="text-sm" style={{ color: "#87A878" }}>No EPDS flags this week</p>
              </div>
            ) : (
              <div className="bg-white divide-y" style={{ borderColor: "#EDE8E3" }}>
                {epdsFlags.map((flag, i) => (
                  <button
                    key={i}
                    onClick={() => { playTap(); if (flag?.mother) setLocation(`/patients/${flag.mother.id}`); }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ backgroundColor: "#F3EDF9", color: "#9B6DC5" }}
                    >
                      {flag?.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#2D2D2D" }}>
                        {flag?.mother?.name}
                      </p>
                      <p className="text-xs" style={{ color: flag?.ppd ? "#C94F6D" : "#9B6DC5" }}>
                        {flag?.ppd ? "PPD risk flagged" : "Score ≥ 10 — follow up"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#AEAEB8" }} />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* All patients shortcut */}
          <button
            onClick={() => { playTap(); setLocation("/patients"); }}
            className="w-full rounded-2xl p-4 flex items-center gap-3 bg-white transition-all hover:opacity-90"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#FCE8EE" }}
            >
              <Users className="w-4 h-4" style={{ color: "#C97C8A" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>All Patients</p>
              <p className="text-xs" style={{ color: "#7A7A8A" }}>
                {mothers?.length ?? "—"} registered
              </p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "#AEAEB8" }} />
          </button>
        </div>
      </div>
    </Layout>
  );
}

function SummaryChip({
  count, label, icon: Icon, bg, color, urgent,
}: {
  count: number; label: string; icon: React.ElementType;
  bg: string; color: string; urgent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{
        backgroundColor: urgent && count > 0 ? bg : "#FFFFFF",
        boxShadow: urgent && count > 0
          ? `0 2px 8px rgba(201,79,109,0.14)`
          : "0 1px 4px rgba(0,0,0,0.07)",
        border: urgent && count > 0 ? `1px solid ${color}30` : "none",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: urgent && count > 0 ? color : "#2D2D2D" }}>
          {count}
        </p>
        <p className="text-xs" style={{ color: "#7A7A8A" }}>{label}</p>
      </div>
    </div>
  );
}
