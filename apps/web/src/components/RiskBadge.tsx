interface RiskBadgeProps {
  level: string | null | undefined;
  size?: "sm" | "md" | "lg";
}

const RISK_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  low:  { bg: "#F0F7ED", text: "#87A878", dot: "#87A878" },
  mid:  { bg: "#FDF3E7", text: "#D4914A", dot: "#D4914A" },
  high: { bg: "#FCE8EE", text: "#C94F6D", dot: "#C94F6D" },
};

export function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  if (!level) return <span className="text-gray-400 text-xs">—</span>;
  const colors = RISK_COLORS[level] ?? RISK_COLORS["low"];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
      data-testid={`risk-badge-${level}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: colors.dot }}
      />
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </span>
  );
}
