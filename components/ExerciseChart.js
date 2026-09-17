"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ExerciseChart({ history }) {
  const data = history.map((h) => ({
    ...h,
    label: h.date.slice(5),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#232c3a" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#8b97a8", fontSize: 11 }}
          axisLine={{ stroke: "#232c3a" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#8b97a8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "#161d28",
            border: "1px solid #232c3a",
            borderRadius: 10,
            fontSize: 12,
          }}
          labelStyle={{ color: "#eef2f7" }}
          formatter={(value, name) => {
            if (name === "estOneRM") return [`${value} kg`, "1RM estimado"];
            if (name === "topWeight") return [`${value} kg`, "Peso mejor serie"];
            return [value, name];
          }}
        />
        <Line
          type="monotone"
          dataKey="estOneRM"
          stroke="#f0abfc"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="topWeight"
          stroke="#7dd3fc"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
