import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "low" | "mid" | "high" | "info";
};

const tones = {
  default: "border-border bg-muted text-muted-foreground",
  low: "border-[#d8ead2] bg-[#F0F7ED] text-[#87A878]",
  mid: "border-[#f4ddb9] bg-[#FDF3E7] text-[#D4914A]",
  high: "border-[#f4c5d0] bg-[#FCE8EE] text-[#C94F6D]",
  info: "border-[#e2d3ee] bg-[#f3ecf9] text-[#9a74b8]"
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
