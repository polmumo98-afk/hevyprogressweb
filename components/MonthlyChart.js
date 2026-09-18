"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function MonthlyChart({ data }) {
  const rows = data.map((d) => ({
    ...d,
    label: MESES[parseInt(d.month.slice(5, 7), 10) - 1],
  }));
  const max = Math.max(...rows.map((r) => r.volumen), 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#5d6b80", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#5d6b80", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{
            background: "rgba(13, 17, 23, 0.95)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: "#f2f6fb", fontWeight: 600 }}
          formatter={(value, name, props) => [
            `${value.toLocaleString("es-ES")} kg · ${props.payload.sesiones} sesiones`,
            "Volumen",
          ]}
        />
        <Bar dataKey="volumen" radius={[7, 7, 0, 0]}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.volumen === max ? "#5eead4" : "rgba(96,165,250,0.55)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
