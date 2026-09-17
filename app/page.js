"use client";

import Nav from "@/components/Nav";
import WeeklyChart from "@/components/WeeklyChart";
import { useDashboardData } from "@/components/useDashboardData";

function StatCard({ label, value, sub }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, error, loading } = useDashboardData();

  return (
    <div className="page">
      <Nav />

      {error && (
        <div className="error-box">
          No se han podido cargar los datos de Hevy: {error}
          <br />
          Revisa que la variable de entorno <code>HEVY_API_KEY</code> esté
          configurada en Vercel.
        </div>
      )}

      {loading && !error && (
        <div className="grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="loading-shimmer" style={{ minHeight: 100 }} />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid">
            <StatCard
              label="Entrenamientos"
              value={data.summary.totalWorkouts}
              sub={`${data.summary.activeDays} días activos`}
            />
            <StatCard
              label="Volumen total"
              value={`${(data.summary.totalVolumeKg / 1000).toFixed(1)} t`}
              sub={`${data.summary.totalVolumeKg.toLocaleString("es-ES")} kg movidos`}
            />
            <StatCard
              label="Series totales"
              value={data.summary.totalSets.toLocaleString("es-ES")}
            />
            <StatCard
              label="Racha semanal"
              value={`${data.summary.weekStreak} sem.`}
              sub="semanas seguidas entrenando"
            />
          </div>

          <div className="two-col">
            <div className="panel">
              <div className="section-title">Últimas 12 semanas</div>
              <WeeklyChart data={data.last12Weeks} />
            </div>

            <div className="panel">
              <div className="section-title">Reparto por grupo muscular</div>
              {data.muscleSplit.slice(0, 8).map((m) => {
                const max = data.muscleSplit[0]?.sets || 1;
                return (
                  <div className="muscle-bar-row" key={m.muscle}>
                    <div className="muscle-label">{m.muscle}</div>
                    <div className="muscle-bar-track">
                      <div
                        className="muscle-bar-fill"
                        style={{ width: `${(m.sets / max) * 100}%` }}
                      />
                    </div>
                    <div className="muscle-count">{m.sets}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="section-title">Entrenamientos recientes</div>
            {data.recentWorkouts.length === 0 && (
              <div className="empty-state">Todavía no hay entrenamientos.</div>
            )}
            {data.recentWorkouts.map((w) => (
              <div className="workout-row" key={w.id}>
                <div>
                  <div className="workout-title">{w.title}</div>
                  <div className="workout-meta">
                    {w.date} · {w.exerciseCount} ejercicios · {w.durationMin} min
                  </div>
                </div>
                <div className="pill">{w.volume.toLocaleString("es-ES")} kg</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="footer-note">
        Datos en vivo desde tu cuenta de Hevy · se refrescan cada 5 minutos
      </div>
    </div>
  );
}
