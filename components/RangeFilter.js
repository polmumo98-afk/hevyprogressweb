"use client";

const OPTIONS = [
  { value: "week", label: "Semana" },
  { value: "30", label: "30 días" },
  { value: "90", label: "3 meses" },
  { value: "365", label: "1 año" },
  { value: "all", label: "Todo" },
];

export default function RangeFilter({ value, onChange }) {
  return (
    <div className="range-filter">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          className={`range-btn ${value === o.value ? "active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
