"use client";

import { useEffect } from "react";

function kg(n) {
  return (n || 0).toLocaleString("es-ES");
}

function setLabel(s) {
  if (s.durationSeconds) {
    const min = Math.round(s.durationSeconds / 60);
    return `${min} min`;
  }
  if (s.distanceMeters) {
    return `${(s.distanceMeters / 1000).toFixed(2)} km`;
  }
  if (s.weight && s.reps) return `${s.weight} kg × ${s.reps}`;
  if (s.reps) return `${s.reps} reps`;
  return "—";
}

export default function WorkoutModal({ workout, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!workout) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 className="modal-title">{workout.title}</h2>
            <div className="row-meta">
              {workout.date} · {workout.exerciseCount} ejercicios ·{" "}
              {workout.sets} series · {workout.durationMin} min ·{" "}
              {kg(workout.volume)} kg
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {(workout.details || []).map((ex, i) => (
            <div className="modal-exercise" key={i}>
              <div className="modal-exercise-head">
                <span className="row-title">{ex.title}</span>
                <span className="row-meta">{ex.muscle}</span>
              </div>
              <div className="modal-sets">
                {ex.sets.map((s, j) => (
                  <div className="modal-set" key={j}>
                    <span className="modal-set-num">{j + 1}</span>
                    <span>{setLabel(s)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(!workout.details || workout.details.length === 0) && (
            <div className="empty-state">
              No hay detalle de series para este entrenamiento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
