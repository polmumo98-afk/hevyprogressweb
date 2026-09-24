"use client";

export default function Heatmap({ days }) {
  // agrupamos en columnas de 7 (semanas)
  const columns = [];
  let current = [];

  // rellenar huecos al principio para que la primera columna empiece en lunes
  const firstWeekday = days[0]?.weekday ?? 0;
  for (let i = 0; i < firstWeekday; i++) current.push(null);

  for (const d of days) {
    current.push(d);
    if (current.length === 7) {
      columns.push(current);
      current = [];
    }
  }
  if (current.length) columns.push(current);

  const volumes = days.filter((d) => d.trained).map((d) => d.volume);
  const max = volumes.length ? Math.max(...volumes) : 0;

  const level = (d) => {
    if (!d || !d.trained) return "";
    if (!max) return "heat-2";
    const ratio = d.volume / max;
    if (ratio > 0.75) return "heat-4";
    if (ratio > 0.5) return "heat-3";
    if (ratio > 0.25) return "heat-2";
    return "heat-1";
  };

  return (
    <div>
      <div className="heatmap">
        {columns.map((col, i) => (
          <div className="heatmap-col" key={i}>
            {col.map((d, j) => (
              <div
                key={j}
                className={`heat-cell ${level(d)}`}
                title={
                  d
                    ? d.trained
                      ? `${d.date} · ${d.volume.toLocaleString("es-ES")} kg`
                      : `${d.date} · descanso`
                    : ""
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heat-legend">
        <span>Menos</span>
        <div className="heat-cell" />
        <div className="heat-cell heat-1" />
        <div className="heat-cell heat-2" />
        <div className="heat-cell heat-3" />
        <div className="heat-cell heat-4" />
        <span>Más volumen</span>
      </div>
    </div>
  );
}
