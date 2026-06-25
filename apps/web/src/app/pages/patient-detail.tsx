import { useParams, useLocation } from "wouter";
import { ArrowLeft, Thermometer, Heart, Droplets, Activity } from "lucide-react";
import { Layout } from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetMother,
  useListCheckins,
  useListAlerts,
  useListEpdsForMother,
  getGetMotherQueryKey,
  getListCheckinsQueryKey,
  getListAlertsQueryKey,
  getListEpdsForMotherQueryKey,
} from "@workspace/api-client-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { formatDistanceToNow, format } from "date-fns";

function VitalCard({
  label,
  value,
  unit,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-4"
      style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <span className="text-xs font-medium" style={{ color: "#7A7A8A" }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: "#2D2D2D" }}>
        {value ?? "—"}
        {value != null && unit && (
          <span className="text-sm font-normal ml-1" style={{ color: "#7A7A8A" }}>{unit}</span>
        )}
      </p>
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const id = params.id;

  const { data: mother, isLoading: motherLoading } = useGetMother(id, {
    query: { enabled: !!id, queryKey: getGetMotherQueryKey(id) },
  });
  const { data: checkins, isLoading: checkinsLoading } = useListCheckins(
    { mother_id: id, limit: 20 },
    { query: { enabled: !!id, queryKey: getListCheckinsQueryKey({ mother_id: id, limit: 20 }) } }
  );
  const { data: alerts } = useListAlerts(
    {},
    { query: { queryKey: getListAlertsQueryKey({}) } }
  );
  const { data: epdsHistory } = useListEpdsForMother(id, {
    query: { enabled: !!id, queryKey: getListEpdsForMotherQueryKey(id) },
  });

  const motherAlerts = alerts?.filter(a => a.mother_id === id) ?? [];
  const latestCheckin = checkins?.[0];
  const latestEpds = epdsHistory?.[0];

  const chartData = [...(checkins ?? [])]
    .reverse()
    .slice(-10)
    .map(c => ({
      date: format(new Date(c.created_at), "MMM d"),
      bp_sys: c.bp_systolic,
      bp_dia: c.bp_diastolic,
      blood_sugar: c.blood_sugar,
      body_temp: c.body_temp,
    }));

  return (
    <Layout title="Patient Detail">
      {/* Back */}
      <button
        onClick={() => setLocation("/patients")}
        className="flex items-center gap-1.5 text-sm mb-5 transition-opacity hover:opacity-70"
        style={{ color: "#7A7A8A" }}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      {/* Header */}
      {motherLoading ? (
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}>
          <Skeleton className="h-7 w-48 mb-2" style={{ backgroundColor: "#FFF0E8" }} />
          <Skeleton className="h-4 w-64 mb-3" style={{ backgroundColor: "#FFF0E8" }} />
          <Skeleton className="h-6 w-24" style={{ backgroundColor: "#FFF0E8" }} />
        </div>
      ) : (
        <div
          className="bg-white rounded-2xl p-6 mb-6"
          style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#2D2D2D" }}>
                {mother?.name ?? "Unknown"}
              </h2>
              <p className="text-sm mb-3" style={{ color: "#7A7A8A" }}>
                {mother?.age} years old
                {mother?.gestational_age != null && ` · ${mother.gestational_age} weeks gestation`}
                {mother?.clinic_name && ` · ${mother.clinic_name}`}
              </p>
              <RiskBadge level={mother?.current_risk_level} size="lg" />
            </div>
            {mother?.due_date && (
              <div
                className="text-center px-4 py-3 rounded-2xl"
                style={{ backgroundColor: "#FFF0E8" }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "#7A7A8A" }}>Due Date</p>
                <p className="text-sm font-semibold" style={{ color: "#C97C8A" }}>
                  {format(new Date(mother.due_date), "MMM d, yyyy")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two-column: chart + vitals */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Chart */}
        <div
          className="col-span-3 bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#2D2D2D" }}>
            Vitals Over Time
          </h3>
          {checkinsLoading ? (
            <Skeleton className="h-48 w-full" style={{ backgroundColor: "#FFF0E8" }} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C97C8A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#C97C8A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E3" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7A7A8A" }} />
                <YAxis tick={{ fontSize: 11, fill: "#7A7A8A" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EDE8E3",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bp_sys"
                  name="BP Systolic"
                  stroke="#C97C8A"
                  fill="url(#bpGrad)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="bp_dia"
                  name="BP Diastolic"
                  stroke="#F9B8C4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="blood_sugar"
                  name="Blood Sugar"
                  stroke="#D4914A"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm" style={{ color: "#7A7A8A" }}>No vitals data yet.</p>
            </div>
          )}
        </div>

        {/* Latest vitals 2x2 grid */}
        <div className="col-span-2 grid grid-cols-2 gap-3 content-start">
          <VitalCard
            label="Blood Pressure"
            value={
              latestCheckin?.bp_systolic != null && latestCheckin?.bp_diastolic != null
                ? `${latestCheckin.bp_systolic}/${latestCheckin.bp_diastolic}`
                : null
            }
            unit="mmHg"
            icon={Activity}
            iconColor="#C97C8A"
            iconBg="#FCE8EE"
          />
          <VitalCard
            label="Blood Sugar"
            value={latestCheckin?.blood_sugar}
            unit="mmol/L"
            icon={Droplets}
            iconColor="#D4914A"
            iconBg="#FDF3E7"
          />
          <VitalCard
            label="Body Temp"
            value={latestCheckin?.body_temp}
            unit="°C"
            icon={Thermometer}
            iconColor="#87A878"
            iconBg="#F0F7ED"
          />
          <VitalCard
            label="Heart Rate"
            value={latestCheckin?.heart_rate}
            unit="bpm"
            icon={Heart}
            iconColor="#C94F6D"
            iconBg="#FCE8EE"
          />
        </div>
      </div>

      {/* EPDS Section */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ backgroundColor: "#F3EDF9", boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: "#2D2D2D" }}>
          Mental Health — EPDS Score
        </h3>
        {latestEpds ? (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold" style={{ color: "#9B6DC5" }}>
                {latestEpds.total_score}
                <span className="text-base font-normal ml-1" style={{ color: "#7A7A8A" }}>/30</span>
              </p>
              <p className="text-xs mt-1" style={{ color: "#7A7A8A" }}>
                {formatDistanceToNow(new Date(latestEpds.created_at), { addSuffix: true })}
              </p>
            </div>
            <div>
              {latestEpds.ppd_flagged ? (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "#FCE8EE", color: "#C94F6D" }}
                >
                  PPD Risk Flagged
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "#F0F7ED", color: "#87A878" }}
                >
                  No PPD Risk
                </span>
              )}
              <p className="text-xs mt-2" style={{ color: "#7A7A8A" }}>
                Score &gt;12 indicates risk of postpartum depression
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "#7A7A8A" }}>No EPDS responses recorded yet.</p>
        )}
      </div>

      {/* Recent alerts for this patient */}
      {motherAlerts.length > 0 && (
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: "#EDE8E3" }}>
            <h3 className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>
              Recent Alerts
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: "#EDE8E3" }}>
            {motherAlerts.slice(0, 5).map(a => (
              <div
                key={a.id}
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderLeft: a.is_read ? "none" : "3px solid #C94F6D" }}
              >
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "#2D2D2D" }}>{a.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!a.is_read && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#C94F6D" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
