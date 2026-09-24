"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function ExerciseChart({ history }) {
  const data = history.map((h) => ({
    ...h,
    label: `${h.date.slice(8)}/${h.date.slice(5, 7)}`,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 6, right: 10, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="rmGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#c084fc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#5d6b80", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#5d6b80", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={34}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(13, 17, 23, 0.95)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: "#f2f6fb", fontWeight: 600 }}
          formatter={(value, name) => [
            `${value} kg`,
            name === "estOneRM" ? "1RM estimado" : "Mejor serie",
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#8a97ab" }}
          iconType="circle"
          iconSize={8}
          formatter={(v) => (v === "estOneRM" ? "1RM estimado" : "Mejor serie")}
        />
        <Area
          type="monotone"
          dataKey="estOneRM"
          stroke="#c084fc"
          strokeWidth={2.2}
          fill="url(#rmGrad)"
          dot={{ r: 3, fill: "#c084fc" }}
        />
        <Line
          type="monotone"
          dataKey="topWeight"
          stroke="#60a5fa"
          strokeWidth={2.2}
          dot={{ r: 3, fill: "#60a5fa" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
