import { useLocation } from "wouter";
import { ClipboardList, TrendingUp, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { MotherLayout } from "@/components/MotherLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuth } from "@/lib/auth";
import { useListMothers, useListCheckins, useListEpdsForMother, getListCheckinsQueryKey, getListEpdsForMotherQueryKey } from "@workspace/api-client-react";
import { formatDistanceToNow, isToday, differenceInDays } from "date-fns";
import { playTap } from "@/lib/sounds";

const RISK_CONFIG = {
  low:  { label: "You're doing well", sub: "Your vitals look healthy. Keep it up!", bg: "#F0F7ED", text: "#87A878", border: "#C6DFC0", emoji: "✓" },
  mid:  { label: "Keep watching", sub: "Some readings need attention. Check in with your clinic soon.", bg: "#FDF3E7", text: "#D4914A", border: "#F0CCА4", emoji: "!" },
  high: { label: "Contact your clinic today", sub: "Your readings are in a concerning range. Please call your clinic or visit immediately.", bg: "#FCE8EE", text: "#C94F6D", border: "#F0ABBE", emoji: "!" },
};

export default function MotherHomePage() {
  const [, setLocation] = useLocation();
  const user = getAuth();

  // Find mother record by name match (mock approach since no user_id linkage yet)
  const { data: allMothers, isLoading: mothersLoading } = useListMothers({});
  const mother = allMothers?.find(m =>
    m.name.toLowerCase().includes(user?.name?.split(" ")[0]?.toLowerCase() ?? "__no_match__")
  ) ?? allMothers?.[0];

  const { data: checkins, isLoading: checkinsLoading } = useListCheckins(
    { mother_id: mother?.id, limit: 7 },
    { query: { enabled: !!mother?.id, queryKey: getListCheckinsQueryKey({ mother_id: mother?.id, limit: 7 }) } }
  );
  const { data: epdsHistory } = useListEpdsForMother(mother?.id ?? "", {
    query: { enabled: !!mother?.id, queryKey: getListEpdsForMotherQueryKey(mother?.id ?? "") },
  });

  const latestCheckin = checkins?.[0];
  const checkedInToday = latestCheckin ? isToday(new Date(latestCheckin.created_at)) : false;
  const daysSinceLastCheckin = latestCheckin
    ? differenceInDays(new Date(), new Date(latestCheckin.created_at))
    : null;
  const riskLevel = (mother?.current_risk_level ?? "low") as keyof typeof RISK_CONFIG;
  const riskCfg = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.low;

  const needsEpds = !epdsHistory?.length ||
    differenceInDays(new Date(), new Date(epdsHistory[0].created_at)) >= 7;

  const loading = mothersLoading || checkinsLoading;

  return (
    <MotherLayout>
      <div className="px-5 py-6 space-y-5">

        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#2D2D2D" }}>
            Hello, {user?.name?.split(" ")[0] ?? "there"}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#7A7A8A" }}>
            {mother?.gestational_age != null
              ? `Week ${mother.gestational_age} of your pregnancy`
              : "Welcome to MatriWatch"}
          </p>
        </div>

        {/* Risk status card */}
        {loading ? (
          <Skeleton className="h-36 w-full rounded-2xl" style={{ backgroundColor: "#FFE8EE" }} />
        ) : (
          <div
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: riskCfg.bg,
              borderColor: riskCfg.border,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.7)", color: riskCfg.text }}
              >
                {riskCfg.emoji}
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: riskCfg.text }}>
                  {riskCfg.label}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "#2D2D2D" }}>
                  {riskCfg.sub}
                </p>
              </div>
            </div>
            {latestCheckin && (
              <p className="text-xs mt-3 pl-1" style={{ color: "#7A7A8A" }}>
                Last check-in {formatDistanceToNow(new Date(latestCheckin.created_at), { addSuffix: true })}
              </p>
            )}
          </div>
        )}

        {/* Check in CTA */}
        {!checkedInToday && (
          <button
            onClick={() => { playTap(); setLocation("/mother/checkin"); }}
            className="w-full rounded-2xl py-5 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95"
            style={{ backgroundColor: "#C97C8A", boxShadow: "0 4px 16px rgba(201,124,138,0.3)" }}
            data-testid="button-checkin-cta"
          >
            <ClipboardList className="w-6 h-6" />
            Check In Today
          </button>
        )}

        {checkedInToday && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: "#F0F7ED", border: "1px solid #C6DFC0" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#87A878" }}
            >
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#87A878" }}>Checked in today</p>
              <p className="text-xs" style={{ color: "#7A7A8A" }}>Great job! See you again tomorrow.</p>
            </div>
          </div>
        )}

        {/* Weekly EPDS prompt */}
        {needsEpds && (
          <button
            onClick={() => { playTap(); setLocation("/mother/epds"); }}
            className="w-full rounded-2xl p-4 text-left flex items-center justify-between gap-3 border transition-all"
            style={{ backgroundColor: "#F3EDF9", borderColor: "#D8C4E8" }}
            data-testid="button-epds-prompt"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#D8C4E8" }}
              >
                <span className="text-lg">💬</span>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#9B6DC5" }}>Weekly Mood Check</p>
                <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>10 quick questions · 3 minutes</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#9B6DC5" }} />
          </button>
        )}

        {/* Due date card */}
        {mother?.due_date && (
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#FFF0E8" }}
            >
              <Calendar className="w-5 h-5" style={{ color: "#C97C8A" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#7A7A8A" }}>Estimated due date</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: "#2D2D2D" }}>
                {new Date(mother.due_date).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#C97C8A" }}>
                {differenceInDays(new Date(mother.due_date), new Date())} days to go
              </p>
            </div>
          </div>
        )}

        {/* Recent readings */}
        {checkins && checkins.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>Recent Readings</h3>
              <button
                onClick={() => { playTap(); setLocation("/mother/history"); }}
                className="text-xs font-medium"
                style={{ color: "#C97C8A" }}
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {checkins.slice(0, 3).map(c => {
                const level = (c.risk_level ?? "low") as keyof typeof RISK_CONFIG;
                const cfg = RISK_CONFIG[level] ?? RISK_CONFIG.low;
                return (
                  <div
                    key={c.id}
                    className="rounded-xl px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(201,124,138,0.06)" }}
                  >
                    <div>
                      <p className="text-xs font-medium" style={{ color: "#2D2D2D" }}>
                        {c.bp_systolic && c.bp_diastolic ? `BP ${c.bp_systolic}/${c.bp_diastolic}` : "—"}
                        {c.body_temp != null && ` · ${c.body_temp}°C`}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: cfg.bg, color: cfg.text }}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missed check-in warning */}
        {daysSinceLastCheckin !== null && daysSinceLastCheckin >= 2 && !checkedInToday && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ backgroundColor: "#FDF3E7", border: "1px solid #F0CCA4" }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#D4914A" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#D4914A" }}>
                You missed {daysSinceLastCheckin} days of check-ins
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>
                Regular check-ins help your doctor stay informed. Please check in today.
              </p>
            </div>
          </div>
        )}
      </div>
    </MotherLayout>
  );
}
