"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

// Colores para agrupar visualmente ejercicios en superserie
const SUPERSET_COLORS = ["#5eead4", "#60a5fa", "#c084fc", "#fbbf24", "#fb7185"];

function ExerciseRow({ ex, supersetColor }) {
  return (
    <div className="routine-ex">
      <div className="routine-ex-left">
        {supersetColor && (
          <span
            className="routine-superset-mark"
            style={{ background: supersetColor }}
            title="Superserie"
          />
        )}
        <div style={{ minWidth: 0 }}>
          <div className="routine-ex-title">{ex.title}</div>
          <div className="routine-ex-meta">
            {ex.muscle ? `${ex.muscle} · ` : ""}
            {ex.setsLabel}
            {ex.rest ? ` · descanso ${ex.rest}` : ""}
          </div>
          {ex.notes && <div className="routine-ex-notes">{ex.notes}</div>}
        </div>
      </div>
    </div>
  );
}

function RoutineCard({ routine }) {
  // asigna un color por superset_id dentro de esta rutina
  const supersetColorMap = new Map();
  let colorIdx = 0;
  for (const ex of routine.exercises) {
    if (ex.supersetId != null && !supersetColorMap.has(ex.supersetId)) {
      supersetColorMap.set(
        ex.supersetId,
        SUPERSET_COLORS[colorIdx % SUPERSET_COLORS.length]
      );
      colorIdx += 1;
    }
  }

  return (
    <div className="panel routine-card">
      <div className="routine-head">
        <div>
          <h2 className="routine-title">{routine.title}</h2>
          <div className="row-meta">
            {routine.exerciseCount} ejercicios · {routine.totalSets} series
          </div>
        </div>
      </div>
      {routine.notes && <div className="routine-notes">{routine.notes}</div>}
      <div className="routine-ex-list">
        {routine.exercises.map((ex, i) => (
          <ExerciseRow
            key={i}
            ex={ex}
            supersetColor={
              ex.supersetId != null ? supersetColorMap.get(ex.supersetId) : null
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function RoutinesPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/routines")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error cargando rutinas");
        return json;
      })
      .then((json) => !cancelled && setData(json))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // agrupar por carpeta
  const groups = {};
  if (data?.routines) {
    for (const r of data.routines) {
      const key = r.folder || "Sin carpeta";
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
  }
  const groupNames = Object.keys(groups);
  const showFolders = groupNames.length > 1 || (groupNames.length === 1 && groupNames[0] !== "Sin carpeta");

  return (
    <div className="page">
      <Nav />

      <div className="hero">
        <h1 className="hero-greeting" style={{ fontSize: "clamp(22px, 3.5vw, 30px)" }}>
          Tus <span className="name">rutinas</span>
        </h1>
        <p className="hero-sub">
          {data
            ? `${data.routines.length} rutinas guardadas en tu cuenta de Hevy`
            : "Cargando desde Hevy..."}
        </p>
      </div>

      {error && <div className="error-box">Error cargando rutinas: {error}</div>}

      {loading && !error && (
        <div className="routine-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 300 }} />
          ))}
        </div>
      )}

      {data && data.routines.length === 0 && (
        <div className="empty-state">No tienes rutinas guardadas en Hevy.</div>
      )}

      {data &&
        groupNames.map((folder) => (
          <div key={folder} style={{ marginBottom: 8 }}>
            {showFolders && (
              <div className="routine-folder-head">
                <span className="routine-folder-name">{folder}</span>
                <span className="section-hint">{groups[folder].length} rutinas</span>
              </div>
            )}
            <div className="routine-grid">
              {groups[folder].map((r) => (
                <RoutineCard key={r.id} routine={r} />
              ))}
            </div>
          </div>
        ))}

      <div className="footer-note">
        Rutinas en vivo desde tu cuenta de Hevy · los colores agrupan las superseries
      </div>
    </div>
  );
}
