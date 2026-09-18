"use client";

const SEGMENTS = [
  { key: "push", label: "Empuje", color: "#5eead4" },
  { key: "pull", label: "Tirón", color: "#60a5fa" },
  { key: "legs", label: "Pierna", color: "#c084fc" },
  { key: "core", label: "Core", color: "#fbbf24" },
];

export default function MuscleBalance({ balance }) {
  const total = balance.push + balance.pull + balance.legs + balance.core;
  if (!total) {
    return <div className="empty-state">Sin datos suficientes.</div>;
  }

  return (
    <div>
      <div className="balance-bar">
        {SEGMENTS.map((s) => {
          const val = balance[s.key];
          const pct = (val / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={s.key}
              className="balance-seg"
              style={{ width: `${pct}%`, background: s.color }}
              title={`${s.label}: ${val} series`}
            />
          );
        })}
      </div>

      <div className="balance-legend">
        {SEGMENTS.map((s) => (
          <div className="balance-legend-item" key={s.key}>
            <span className="balance-dot" style={{ background: s.color }} />
            <span>{s.label}</span>
            <strong>{balance[`${s.key}Pct`]}%</strong>
          </div>
        ))}
      </div>

      <div className="balance-ratios">
        {balance.pushPullRatio !== null && (
          <div className="balance-ratio">
            <span className="mini-stat-label">Empuje / Tirón</span>
            <span className="balance-ratio-value">
              {balance.pushPullRatio.toFixed(2)}
            </span>
          </div>
        )}
        {balance.upperLowerRatio !== null && (
          <div className="balance-ratio">
            <span className="mini-stat-label">Superior / Inferior</span>
            <span className="balance-ratio-value">
              {balance.upperLowerRatio.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {balance.notes.length > 0 && (
        <div className="balance-notes">
          {balance.notes.map((n, i) => (
            <div className="balance-note" key={i}>
              {n}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
