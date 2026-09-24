"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const axisStyle = { fill: "#5d6b80", fontSize: 11 };

const tooltipStyle = {
  background: "rgba(13, 17, 23, 0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  fontSize: 12,
  backdropFilter: "blur(10px)",
};

export default function WeeklyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <ComposedChart data={data} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5eead4" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#5eead4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={axisStyle}
          tickFormatter={(v) => v.slice(8) + "/" + v.slice(5, 7)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          width={46}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#f2f6fb", fontWeight: 600 }}
          formatter={(value, name) =>
            name === "volumen"
              ? [`${value.toLocaleString("es-ES")} kg`, "Volumen"]
              : [value, "Sesiones"]
          }
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#8a97ab" }} iconType="circle" iconSize={8} />
        <Bar yAxisId="left" dataKey="sesiones" name="sesiones" fill="#60a5fa" radius={[6, 6, 0, 0]} barSize={16} />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="volumen"
          name="volumen"
          stroke="#5eead4"
          strokeWidth={2.2}
          fill="url(#volGrad)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
