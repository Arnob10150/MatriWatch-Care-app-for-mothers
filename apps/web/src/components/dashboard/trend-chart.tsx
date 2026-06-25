"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { day: "May 4", low: 86, mid: 10, high: 4 },
  { day: "May 5", low: 82, mid: 13, high: 5 },
  { day: "May 6", low: 79, mid: 15, high: 6 },
  { day: "May 7", low: 81, mid: 12, high: 7 },
  { day: "May 8", low: 78, mid: 14, high: 8 },
  { day: "May 9", low: 76, mid: 16, high: 8 },
  { day: "May 10", low: 74, mid: 17, high: 9 }
];

export function TrendChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="highRisk" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="midRisk" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tickLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              color: "hsl(var(--foreground))"
            }}
          />
          <Area dataKey="mid" name="Mid risk" stroke="#f59e0b" fill="url(#midRisk)" strokeWidth={2} />
          <Area dataKey="high" name="High risk" stroke="#f87171" fill="url(#highRisk)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

