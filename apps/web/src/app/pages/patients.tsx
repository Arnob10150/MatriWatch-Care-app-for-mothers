import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMothers } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

export default function PatientsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: mothers, isLoading } = useListMothers({});

  const filtered = mothers?.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <Layout title="Patients">
      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#7A7A8A" }} />
        <input
          type="search"
          placeholder="Search patients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none"
          style={{ borderColor: "#EDE8E3", backgroundColor: "#FFFFFF", color: "#2D2D2D" }}
          onFocus={e => (e.target.style.borderColor = "#F9B8C4")}
          onBlur={e => (e.target.style.borderColor = "#EDE8E3")}
          data-testid="input-search-patients"
        />
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FFF8F0" }}>
                {["Name", "Age", "Risk Level", "Last Check-in", "Gest. Age", "Clinic", ""].map(h => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-medium"
                    style={{ color: "#7A7A8A" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "#EDE8E3" }}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full" style={{ backgroundColor: "#FFF0E8" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map(m => (
                    <tr
                      key={m.id}
                      className="border-t transition-colors hover:bg-gray-50 cursor-pointer"
                      style={{
                        borderColor: "#EDE8E3",
                        borderLeft: m.current_risk_level === "high" ? "3px solid #C94F6D" : "3px solid transparent",
                      }}
                      onClick={() => setLocation(`/patients/${m.id}`)}
                      data-testid={`row-patient-${m.id}`}
                    >
                      <td className="px-6 py-4 font-semibold" style={{ color: "#2D2D2D" }}>
                        {m.name}
                      </td>
                      <td className="px-6 py-4" style={{ color: "#7A7A8A" }}>{m.age} yrs</td>
                      <td className="px-6 py-4">
                        <RiskBadge level={m.current_risk_level} />
                      </td>
                      <td className="px-6 py-4 text-xs" style={{ color: "#7A7A8A" }}>
                        {m.last_checkin_at
                          ? formatDistanceToNow(new Date(m.last_checkin_at), { addSuffix: true })
                          : "No check-ins"}
                      </td>
                      <td className="px-6 py-4" style={{ color: "#7A7A8A" }}>
                        {m.gestational_age != null ? `${m.gestational_age}w` : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs" style={{ color: "#7A7A8A" }}>
                        {m.clinic_name ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={e => { e.stopPropagation(); setLocation(`/patients/${m.id}`); }}
                          className="text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
                          style={{ color: "#C97C8A", backgroundColor: "#FCE8EE" }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F9D0DA")}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FCE8EE")}
                          data-testid={`button-view-${m.id}`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm" style={{ color: "#7A7A8A" }}>
                      {search ? "No patients match your search." : "No patients found."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
