"use client";

import { useMemo, useState } from "react";
import Nav from "@/components/Nav";
import ExerciseChart from "@/components/ExerciseChart";
import GoalTracker from "@/components/GoalTracker";
import { useDashboardData } from "@/components/useDashboardData";

function kg(n) {
  return (n || 0).toLocaleString("es-ES");
}

export default function ExercisesPage() {
  const { data, error, loading } = useDashboardData();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.exercises.filter(
      (e) =>
        e.title.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q)
    );
  }, [data, search]);

  const selected =
    data?.exercises.find((e) => e.id === selectedId) || filtered[0] || null;

  const progress = useMemo(() => {
    if (!selected || selected.history.length < 2) return null;
    const first = selected.history[0];
    const last = selected.history[selected.history.length - 1];
    if (!first.estOneRM) return null;
    const diff = ((last.estOneRM - first.estOneRM) / first.estOneRM) * 100;
    return Math.round(diff);
  }, [selected]);

  return (
    <div className="page">
      <Nav />

      <div className="hero">
        <h1 className="hero-greeting" style={{ fontSize: "clamp(22px, 3.5vw, 30px)" }}>
          Progreso por <span className="name">ejercicio</span>
        </h1>
        <p className="hero-sub">
          Pesos en kg · 1RM estimado con la fórmula de Epley
        </p>
      </div>

      {error && <div className="error-box">Error cargando datos: {error}</div>}
      {loading && !error && (
        <div className="two-col">
          <div className="skeleton" style={{ height: 420 }} />
          <div className="skeleton" style={{ height: 420 }} />
        </div>
      )}

      {data && (
        <div className="two-col">
          <div className="panel">
            {selected ? (
              <>
                <div className="section-head">
                  <h2 className="section-title" style={{ fontSize: 19 }}>
                    {selected.title}
                  </h2>
                  <span className="section-hint">
                    {selected.muscle}
                    {selected.equipment ? ` · ${selected.equipment}` : ""}
                  </span>
                </div>

                <div className="mini-stats">
                  <div className="mini-stat">
                    <div className="mini-stat-label">Mejor peso</div>
                    <div className="mini-stat-value">{selected.bestWeight} kg</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-stat-label">1RM est.</div>
                    <div className="mini-stat-value">{selected.bestOneRM} kg</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-stat-label">Sesiones</div>
                    <div className="mini-stat-value">{selected.sessions}</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-stat-label">Volumen</div>
                    <div className="mini-stat-value">
                      {kg(selected.totalVolume)} kg
                    </div>
                  </div>
                  {progress !== null && (
                    <div className="mini-stat">
                      <div className="mini-stat-label">Progreso</div>
                      <div
                        className="mini-stat-value"
                        style={{
                          color: progress >= 0 ? "var(--accent)" : "var(--danger)",
                        }}
                      >
                        {progress > 0 ? "+" : ""}
                        {progress}%
                      </div>
                    </div>
                  )}
                </div>

                <GoalTracker exercise={selected} />

                {selected.history.length > 1 ? (
                  <ExerciseChart history={selected.history} />
                ) : (
                  <div className="empty-state">
                    Solo hay una sesión registrada de este ejercicio. Con dos o más
                    verás la evolución aquí.
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <div className="section-head">
                    <h3 className="section-title">Historial</h3>
                    <span className="section-hint">mejor serie de cada día</span>
                  </div>
                  {[...selected.history].reverse().slice(0, 10).map((h, i) => (
                    <div className="row" key={`${h.date}-${i}`}>
                      <div>
                        <div className="row-title">
                          {h.topWeight} kg × {h.topReps}
                          {h.isPR && (
                            <span className="pill gold" style={{ marginLeft: 8 }}>
                              PR
                            </span>
                          )}
                        </div>
                        <div className="row-meta">
                          {h.date} · {h.sets} series · {kg(h.volume)} kg de volumen
                        </div>
                      </div>
                      <span className="pill blue">{h.estOneRM} kg 1RM</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                No hay ejercicios que coincidan con la búsqueda.
              </div>
            )}
          </div>

          <div className="panel">
            <input
              placeholder="Buscar ejercicio o músculo..."
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
                  <div style={{ minWidth: 0 }}>
                    <div>{ex.title}</div>
                    <div className="exercise-item-muscle">
                      {ex.muscle} · {ex.bestWeight} kg máx.
                    </div>
                  </div>
                  <span className="row-meta">{ex.sessions}</span>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="empty-state">Sin resultados</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
