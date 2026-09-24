"use client";

function kg(n) {
  return (n || 0).toLocaleString("es-ES");
}

export default function WeekView({ days, onWorkoutClick }) {
  const trainedDays = days.filter((d) => d.trained).length;
  const weekVolume = days.reduce((a, d) => a + d.volume, 0);

  return (
    <div>
      <div className="week-summary">
        <span className="week-summary-item">
          <strong>{trainedDays}</strong> {trainedDays === 1 ? "día" : "días"} entrenados
        </span>
        <span className="week-summary-item">
          <strong>{kg(weekVolume)}</strong> kg movidos
        </span>
      </div>

      <div className="week-grid">
        {days.map((d) => (
          <div
            key={d.date}
            className={`week-day ${d.trained ? "trained" : ""} ${
              d.isToday ? "today" : ""
            } ${d.isFuture ? "future" : ""}`}
          >
            <div className="week-day-head">
              <span className="week-day-name">{d.dayShort}</span>
              <span className="week-day-num">{d.date.slice(8)}</span>
            </div>

            {d.trained ? (
              <div className="week-day-body">
                {d.workouts.map((w, i) => (
                  <div
                    key={i}
                    className="week-workout"
                    onClick={() => onWorkoutClick && onWorkoutClick(w, d)}
                  >
                    <div className="week-workout-title">{w.title}</div>
                    <div className="week-workout-meta">
                      {w.sets} series · {kg(w.volume)} kg
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="week-day-rest">
                {d.isFuture ? "" : d.isToday ? "hoy" : "descanso"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
