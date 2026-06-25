import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "pink" | "rose" | "peach" | "sage";
};

const toneClasses = {
  pink: "border-[#fbd6de] bg-[#fff4f6] text-[#C97C8A]",
  rose: "border-[#f4c5d0] bg-[#FCE8EE] text-[#C94F6D]",
  peach: "border-[#ffe4c8] bg-[#fff6ec] text-[#d4914a]",
  sage: "border-[#d8ead2] bg-[#F0F7ED] text-[#87A878]"
};

export function MetricCard({ label, value, detail, icon, tone = "pink" }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
