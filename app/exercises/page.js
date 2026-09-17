"use client";

import { useMemo, useState } from "react";
import Nav from "@/components/Nav";
import ExerciseChart from "@/components/ExerciseChart";
import { useDashboardData } from "@/components/useDashboardData";

export default function ExercisesPage() {
  const { data, error, loading } = useDashboardData();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.exercises.filter((e) => e.title.toLowerCase().includes(q));
  }, [data, search]);

  const selected =
    data?.exercises.find((e) => e.id === selectedId) || filtered[0] || null;

  return (
    <div className="page">
      <Nav />

      {error && <div className="error-box">Error cargando datos: {error}</div>}
      {loading && !error && (
        <div className="loading-shimmer" style={{ minHeight: 400 }} />
      )}

      {data && (
        <div className="two-col">
          <div className="panel">
            <div className="section-title">Progreso</div>
            {selected ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 20 }}>{selected.title}</h2>
                  <span className="workout-meta">{selected.muscle}</span>
                </div>
                <div className="workout-meta" style={{ marginBottom: 16 }}>
                  {selected.sessions} sesiones registradas · línea rosa = 1RM estimado, línea azul = peso de tu mejor serie
                </div>
                <ExerciseChart history={selected.history} />
              </>
            ) : (
              <div className="empty-state">
                No hay ejercicios que coincidan con la búsqueda.
              </div>
            )}
          </div>

          <div className="panel">
            <input
              placeholder="Buscar ejercicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", marginBottom: 14 }}
            />
            <div className="exercise-list">
              {filtered.map((ex) => (
                <div
                  key={ex.id}
                  className={`exercise-item ${selected?.id === ex.id ? "active" : ""}`}
                  onClick={() => setSelectedId(ex.id)}
                >
                  <div>
                    <div>{ex.title}</div>
                    <div className="exercise-item-muscle">{ex.muscle}</div>
                  </div>
                  <span className="workout-meta">{ex.sessions}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
