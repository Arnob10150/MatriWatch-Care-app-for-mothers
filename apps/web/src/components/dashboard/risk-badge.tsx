import type { RiskLevel } from "@matriwatch/shared";
import { Badge } from "@/components/ui/badge";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const tone = level === "High" ? "high" : level === "Mid" ? "mid" : "low";
  return (
    <Badge tone={tone} className="gap-1.5 rounded-full px-2.5">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level} risk
    </Badge>
  );
}
