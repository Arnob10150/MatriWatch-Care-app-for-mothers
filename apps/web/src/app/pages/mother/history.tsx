import { MotherLayout } from "@/components/MotherLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMothers, useListCheckins, getListCheckinsQueryKey } from "@workspace/api-client-react";
import { getAuth } from "@/lib/auth";
import { format } from "date-fns";

const RISK_COLORS = {
  low:  { bg: "#F0F7ED", text: "#87A878", dot: "#87A878", label: "Low" },
  mid:  { bg: "#FDF3E7", text: "#D4914A", dot: "#D4914A", label: "Mid" },
  high: { bg: "#FCE8EE", text: "#C94F6D", dot: "#C94F6D", label: "High" },
};

export default function HistoryPage() {
  const user = getAuth();
  const { data: allMothers } = useListMothers({});
  const mother = allMothers?.find(m =>
    m.name.toLowerCase().includes(user?.name?.split(" ")[0]?.toLowerCase() ?? "__no_match__")
  ) ?? allMothers?.[0];

  const { data: checkins, isLoading } = useListCheckins(
    { mother_id: mother?.id, limit: 30 },
    { query: { enabled: !!mother?.id, queryKey: getListCheckinsQueryKey({ mother_id: mother?.id, limit: 30 }) } }
  );

  return (
    <MotherLayout title="My History">
      <div className="px-5 py-6 space-y-4">
        <p className="text-sm" style={{ color: "#7A7A8A" }}>
          Your last {checkins?.length ?? 0} check-ins
        </p>

        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" style={{ backgroundColor: "#FFE8EE" }} />
            ))
          : checkins?.map(c => {
              const level = (c.risk_level ?? "low") as keyof typeof RISK_COLORS;
              const colors = RISK_COLORS[level] ?? RISK_COLORS.low;
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl p-4"
                  style={{
                    boxShadow: "0 1px 4px rgba(201,124,138,0.08)",
                    borderLeft: `3px solid ${colors.dot}`,
                  }}
                  data-testid={`history-card-${c.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>
                      {format(new Date(c.created_at), "EEE, d MMM yyyy")}
                    </p>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {colors.label} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Stat
                      label="BP"
                      value={
                        c.bp_systolic != null && c.bp_diastolic != null
                          ? `${c.bp_systolic}/${c.bp_diastolic}`
                          : "—"
                      }
                      unit="mmHg"
                    />
                    <Stat label="Sugar" value={c.blood_sugar?.toFixed(1) ?? "—"} unit="mmol/L" />
                    <Stat label="Temp" value={c.body_temp?.toFixed(1) ?? "—"} unit="°C" />
                  </div>

                  {c.symptoms && c.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {c.symptoms.map(s => (
                        <span
                          key={s}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "#FFF0E8", color: "#C97C8A" }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

        {!isLoading && !checkins?.length && (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold" style={{ color: "#2D2D2D" }}>No check-ins yet</p>
            <p className="text-sm mt-1" style={{ color: "#7A7A8A" }}>
              Start your first check-in today to track your health journey.
            </p>
          </div>
        )}
      </div>
    </MotherLayout>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#FFF8F0" }}>
      <p className="text-xs" style={{ color: "#7A7A8A" }}>{label}</p>
      <p className="text-sm font-bold mt-0.5" style={{ color: "#2D2D2D" }}>{value}</p>
      <p className="text-xs" style={{ color: "#AEAEB8" }}>{unit}</p>
    </div>
  );
}
