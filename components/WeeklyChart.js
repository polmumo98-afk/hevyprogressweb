"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function WeeklyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#232c3a" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: "#8b97a8", fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)}
          axisLine={{ stroke: "#232c3a" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: "#8b97a8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: "#8b97a8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{
            background: "#161d28",
            border: "1px solid #232c3a",
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: "#eef2f7" }}
        />
        <Bar
          yAxisId="left"
          dataKey="sesiones"
          fill="#7dd3fc"
          radius={[6, 6, 0, 0]}
          barSize={18}
        />
        <Line
          yAxisId="right"
          dataKey="volumen"
          stroke="#6ee7b7"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
