import { useLocation } from "wouter";
import { Users, AlertTriangle, Bell, Activity, TrendingUp, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDashboardStats,
  useListMothers,
  getGetDashboardStatsQueryKey,
  getListMothersQueryKey,
} from "@workspace/api-client-react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { playTap } from "@/lib/sounds";

function StatCard({
  title, value, icon: Icon, iconBg, iconColor, loading, highlight, sub,
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  loading: boolean;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{
        boxShadow: highlight
          ? "0 2px 12px rgba(201,79,109,0.15)"
          : "0 1px 4px rgba(201,124,138,0.08)",
        border: highlight ? "1px solid #F9D0DA" : "1px solid transparent",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {highlight && (value ?? 0) > 0 && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#FCE8EE", color: "#C94F6D" }}
          >
            Needs attention
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16 mb-1" style={{ backgroundColor: "#FFF0E8" }} />
      ) : (
        <p className="text-3xl font-black" style={{ color: highlight ? "#C94F6D" : "#2D2D2D" }}>
          {value ?? 0}
        </p>
      )}
      <p className="text-xs font-medium mt-1" style={{ color: "#7A7A8A" }}>{title}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#AEAEB8" }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats(
    {},
    { query: { queryKey: getGetDashboardStatsQueryKey({}) } }
  );
  const { data: mothers, isLoading: mothersLoading } = useListMothers(
    {},
    { query: { queryKey: getListMothersQueryKey({}) } }
  );

  const highRisk = (mothers ?? []).filter(m => m.current_risk_level === "high");
  const midRisk = (mothers ?? []).filter(m => m.current_risk_level === "mid");

  return (
    <Layout title="Patient Overview">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={stats?.total_patients}
            icon={Users}
            iconBg="#FCE8EE"
            iconColor="#C97C8A"
            loading={statsLoading}
          />
          <StatCard
            title="High Risk Today"
            value={stats?.high_risk_count}
            icon={AlertTriangle}
            iconBg="#FCE8EE"
            iconColor="#C94F6D"
            loading={statsLoading}
            highlight={(stats?.high_risk_count ?? 0) > 0}
          />
          <StatCard
            title="Alerts Today"
            value={stats?.alerts_today}
            icon={Bell}
            iconBg="#FFF8EE"
            iconColor="#D4914A"
            loading={statsLoading}
          />
          <StatCard
            title="Check-ins Today"
            value={stats?.checkins_today}
            icon={Activity}
            iconBg="#F0F7ED"
            iconColor="#87A878"
            loading={statsLoading}
            sub="out of total patients"
          />
        </div>

        {/* High-risk callout */}
        {!statsLoading && highRisk.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, #FCE8EE 0%, #FFF0E8 100%)",
              border: "1px solid #F0ABBE",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#C94F6D" }}
              >
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold" style={{ color: "#C94F6D" }}>
                {highRisk.length} patient{highRisk.length > 1 ? "s" : ""} flagged high risk — review today
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {highRisk.map(m => (
                <button
                  key={m.id}
                  onClick={() => { playTap(); setLocation(`/patients/${m.id}`); }}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 text-left transition-all hover:opacity-90"
                  style={{ boxShadow: "0 1px 4px rgba(201,79,109,0.10)" }}
                  data-testid={`high-risk-card-${m.id}`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ backgroundColor: "#FCE8EE", color: "#C94F6D" }}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#2D2D2D" }}>
                      {m.name}
                    </p>
                    <p className="text-xs" style={{ color: "#7A7A8A" }}>
                      {m.gestational_age != null ? `Week ${m.gestational_age}` : ""}
                      {m.last_checkin_at
                        ? ` · ${formatDistanceToNow(new Date(m.last_checkin_at), { addSuffix: true })}`
                        : ""}
                    </p>
                  </div>
                  <TrendingUp className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: "#C94F6D" }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Patient table */}
        <div className="grid grid-cols-12 gap-5">
          {/* Main table */}
          <div
            className="col-span-8 bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
          >
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#EDE8E3" }}>
              <h2 className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>All Patients</h2>
              <span className="text-xs" style={{ color: "#7A7A8A" }}>
                {mothers?.length ?? 0} registered
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#FFF8F0" }}>
                    {["Name", "Risk", "Last Check-in", "Gestation", ""].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-medium"
                        style={{ color: "#7A7A8A" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mothersLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: "#EDE8E3" }}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <td key={j} className="px-5 py-4">
                              <Skeleton className="h-4 w-full" style={{ backgroundColor: "#FFF0E8" }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : mothers?.map(m => {
                        const overdue = m.last_checkin_at
                          ? differenceInHours(new Date(), new Date(m.last_checkin_at)) >= 48
                          : true;
                        return (
                          <tr
                            key={m.id}
                            className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                            style={{
                              borderColor: "#EDE8E3",
                              borderLeft:
                                m.current_risk_level === "high"
                                  ? "3px solid #C94F6D"
                                  : overdue
                                  ? "3px solid #D4914A"
                                  : "3px solid transparent",
                            }}
                            onClick={() => { playTap(); setLocation(`/patients/${m.id}`); }}
                            data-testid={`row-patient-${m.id}`}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ backgroundColor: "#FCE8EE", color: "#C97C8A" }}
                                >
                                  {m.name.charAt(0)}
                                </div>
                                <span className="font-medium" style={{ color: "#2D2D2D" }}>{m.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <RiskBadge level={m.current_risk_level} />
                            </td>
                            <td className="px-5 py-3.5">
                              <div>
                                <p className="text-xs" style={{ color: "#2D2D2D" }}>
                                  {m.last_checkin_at
                                    ? formatDistanceToNow(new Date(m.last_checkin_at), { addSuffix: true })
                                    : "Never"}
                                </p>
                                {overdue && (
                                  <p className="text-xs mt-0.5" style={{ color: "#D4914A" }}>Overdue</p>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs" style={{ color: "#7A7A8A" }}>
                              {m.gestational_age != null ? `Week ${m.gestational_age}` : "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className="text-xs font-medium px-2.5 py-1 rounded-xl"
                                style={{ backgroundColor: "#FCE8EE", color: "#C97C8A" }}
                              >
                                View
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right side: at-a-glance */}
          <div className="col-span-4 space-y-4">
            <div
              className="bg-white rounded-2xl p-5"
              style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
            >
              <h3 className="text-sm font-semibold mb-4" style={{ color: "#2D2D2D" }}>Risk breakdown</h3>
              {mothersLoading ? (
                <Skeleton className="h-32" style={{ backgroundColor: "#FFF0E8" }} />
              ) : (
                <div className="space-y-3">
                  <RiskRow
                    label="High Risk"
                    count={highRisk.length}
                    total={mothers?.length ?? 1}
                    barColor="#C94F6D"
                    bg="#FCE8EE"
                  />
                  <RiskRow
                    label="Mid Risk"
                    count={midRisk.length}
                    total={mothers?.length ?? 1}
                    barColor="#D4914A"
                    bg="#FDF3E7"
                  />
                  <RiskRow
                    label="Low Risk"
                    count={(mothers?.length ?? 0) - highRisk.length - midRisk.length}
                    total={mothers?.length ?? 1}
                    barColor="#87A878"
                    bg="#F0F7ED"
                  />
                </div>
              )}
            </div>

            {/* Overdue */}
            <div
              className="bg-white rounded-2xl p-5"
              style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: "#D4914A" }} />
                <h3 className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>Overdue check-ins</h3>
              </div>
              {mothersLoading ? (
                <Skeleton className="h-20" style={{ backgroundColor: "#FFF0E8" }} />
              ) : (
                <>
                  {(mothers ?? [])
                    .filter(m => {
                      if (!m.last_checkin_at) return true;
                      return differenceInHours(new Date(), new Date(m.last_checkin_at)) >= 48;
                    })
                    .slice(0, 4)
                    .map(m => (
                      <button
                        key={m.id}
                        onClick={() => { playTap(); setLocation(`/patients/${m.id}`); }}
                        className="w-full flex items-center gap-2 py-1.5 hover:opacity-70 transition-opacity text-left"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "#D4914A" }}
                        />
                        <span className="text-sm" style={{ color: "#2D2D2D" }}>{m.name}</span>
                        <span className="text-xs ml-auto" style={{ color: "#7A7A8A" }}>
                          {m.last_checkin_at
                            ? `${Math.floor(differenceInHours(new Date(), new Date(m.last_checkin_at)))}h`
                            : "never"}
                        </span>
                      </button>
                    ))}
                  {(mothers ?? []).filter(m => {
                    if (!m.last_checkin_at) return true;
                    return differenceInHours(new Date(), new Date(m.last_checkin_at)) >= 48;
                  }).length === 0 && (
                    <p className="text-sm" style={{ color: "#87A878" }}>All patients checked in recently</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function RiskRow({
  label, count, total, barColor, bg,
}: {
  label: string; count: number; total: number; barColor: string; bg: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span style={{ color: "#2D2D2D" }}>{label}</span>
        <span style={{ color: "#7A7A8A" }}>{count} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: "#EDE8E3" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
