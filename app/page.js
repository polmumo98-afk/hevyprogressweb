"use client";

import Nav from "@/components/Nav";
import WeeklyChart from "@/components/WeeklyChart";
import MonthlyChart from "@/components/MonthlyChart";
import Heatmap from "@/components/Heatmap";
import { useDashboardData } from "@/components/useDashboardData";
import {
  IconDumbbell,
  IconWeight,
  IconLayers,
  IconFlame,
  IconClock,
  IconTrophy,
  IconTrendUp,
  IconTrendDown,
  IconCalendar,
  IconGrid,
} from "@/components/Icons";

const USER_NAME = process.env.NEXT_PUBLIC_USER_NAME || "Pol";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 14) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
}

function todayLabel() {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function kg(n) {
  return n.toLocaleString("es-ES");
}

function StatCard({ label, value, unit, sub, icon, trend, delay }) {
  return (
    <div className={`card ${delay || ""}`}>
      <div className="card-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {(sub || trend) && (
        <div className="stat-sub">
          {trend}
          {sub && <span>{sub}</span>}
        </div>
      )}
    </div>
  );
}

function Trend({ current, previous }) {
  if (!previous) return null;
  const diff = ((current - previous) / previous) * 100;
  if (Math.abs(diff) < 1) {
    return <span className="trend flat">sin cambios</span>;
  }
  const up = diff > 0;
  return (
    <span className={`trend ${up ? "up" : "down"}`}>
      {up ? <IconTrendUp /> : <IconTrendDown />}
      {Math.abs(Math.round(diff))}%
    </span>
  );
}

export default function DashboardPage() {
  const { data, error, loading } = useDashboardData();

  return (
    <div className="page">
      <Nav />

      <div className="hero">
        <h1 className="hero-greeting">
          {greeting()}, <span className="name">{USER_NAME}</span>
        </h1>
        <p className="hero-sub">
          {todayLabel().charAt(0).toUpperCase() + todayLabel().slice(1)}
          {data && data.summary.daysSinceLast !== null && (
            <>
              {" · "}
              {data.summary.daysSinceLast === 0
                ? "hoy ya has entrenado 💪"
                : data.summary.daysSinceLast === 1
                ? "último entreno ayer"
                : `hace ${data.summary.daysSinceLast} días del último entreno`}
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="error-box">
          No se han podido cargar los datos de Hevy: {error}
          <br />
          Comprueba que la variable <code>HEVY_API_KEY</code> está configurada en Vercel.
        </div>
      )}

      {loading && !error && (
        <>
          <div className="grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 130 }} />
            ))}
          </div>
          <div className="two-col">
            <div className="skeleton" style={{ height: 320 }} />
            <div className="skeleton" style={{ height: 320 }} />
          </div>
        </>
      )}

      {data && (
        <>
          {/* ---- KPIs principales ---- */}
          <div className="grid">
            <StatCard
              label="Volumen total"
              value={kg(data.summary.totalVolumeKg)}
              unit="kg"
              sub={`${kg(data.summary.avgVolumePerWorkout)} kg por sesión de media`}
              icon={<IconWeight />}
            />
            <StatCard
              label="Esta semana"
              value={kg(data.summary.thisWeekVolume)}
              unit="kg"
              trend={
                <Trend
                  current={data.summary.thisWeekVolume}
                  previous={data.summary.prevWeekVolume}
                />
              }
              sub={`vs. semana pasada · ${data.summary.thisWeekSessions} sesiones`}
              icon={<IconTrendUp />}
              delay="delay-1"
            />
            <StatCard
              label="Entrenamientos"
              value={data.summary.totalWorkouts}
              sub={`${data.summary.totalSets} series · ${kg(data.summary.totalReps)} reps`}
              icon={<IconDumbbell />}
              delay="delay-2"
            />
            <StatCard
              label="Racha semanal"
              value={data.summary.weekStreak}
              unit={data.summary.weekStreak === 1 ? "semana" : "semanas"}
              sub="seguidas entrenando"
              icon={<IconFlame />}
              delay="delay-3"
            />
          </div>

          <div className="grid">
            <StatCard
              label="Tiempo entrenado"
              value={data.summary.totalHours}
              unit="h"
              sub={`${data.summary.avgDurationMin} min de media por sesión`}
              icon={<IconClock />}
            />
            <StatCard
              label="Días activos"
              value={data.summary.activeDays}
              sub={`${data.summary.exerciseVariety} ejercicios distintos`}
              icon={<IconCalendar />}
              delay="delay-1"
            />
            <StatCard
              label="Cardio"
              value={data.summary.totalCardioMin}
              unit="min"
              sub={
                data.summary.totalDistanceKm > 0
                  ? `${data.summary.totalDistanceKm} km recorridos`
                  : "tiempo acumulado"
              }
              icon={<IconClock />}
              delay="delay-2"
            />
            <StatCard
              label="Mejor semana"
              value={
                data.summary.bestWeek ? kg(data.summary.bestWeek.volume) : "—"
              }
              unit={data.summary.bestWeek ? "kg" : ""}
              sub={
                data.summary.bestWeek
                  ? `semana del ${data.summary.bestWeek.week.slice(8)}/${data.summary.bestWeek.week.slice(5, 7)}`
                  : "sin datos"
              }
              icon={<IconTrophy />}
              delay="delay-3"
            />
          </div>

          {/* ---- Actividad ---- */}
          <div className="panel">
            <div className="section-head">
              <h2 className="section-title">Actividad de los últimos 4 meses</h2>
              <span className="section-hint">
                cuanto más verde, más volumen movido ese día
              </span>
            </div>
            <Heatmap days={data.heatmap} />
          </div>

          {/* ---- Semanas + músculos ---- */}
          <div className="two-col">
            <div className="panel">
              <div className="section-head">
                <h2 className="section-title">Últimas 12 semanas</h2>
                <span className="section-hint">sesiones y volumen (kg)</span>
              </div>
              <WeeklyChart data={data.last12Weeks} />
            </div>

            <div className="panel">
              <div className="section-head">
                <h2 className="section-title">Series por grupo muscular</h2>
              </div>
              {data.muscleSplit.slice(0, 9).map((m) => {
                const max = data.muscleSplit[0]?.sets || 1;
                return (
                  <div className="bar-row" key={m.muscle}>
                    <div className="bar-label">{m.muscle}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(m.sets / max) * 100}%` }}
                      />
                    </div>
                    <div className="bar-count">{m.sets}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- Récords + volumen mensual ---- */}
          <div className="two-col-even">
            <div className="panel">
              <div className="section-head">
                <h2 className="section-title">Récords personales</h2>
                <span className="section-hint">tu mejor marca por ejercicio</span>
              </div>
              {data.personalRecords.length === 0 && (
                <div className="empty-state">Aún no hay récords registrados.</div>
              )}
              {data.personalRecords.map((pr, i) => (
                <div className="row" key={pr.id}>
                  <div className="row-left">
                    <span className="pr-rank">{i + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="row-title">{pr.title}</div>
                      <div className="row-meta">
                        {pr.muscle}
                        {pr.date ? ` · ${pr.date}` : ""}
                        {pr.reps ? ` · ${pr.reps} reps` : ""}
                      </div>
                    </div>
                  </div>
                  <span className="pill gold">{pr.bestWeight} kg</span>
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="section-head">
                <h2 className="section-title">Volumen por mes</h2>
                <span className="section-hint">últimos 6 meses (kg)</span>
              </div>
              <MonthlyChart data={data.monthly} />
              <div className="mini-stats" style={{ marginTop: 18, marginBottom: 0 }}>
                {data.weekdaySplit
                  .filter((d) => d.sesiones > 0)
                  .slice(0, 4)
                  .map((d) => (
                    <div className="mini-stat" key={d.day}>
                      <div className="mini-stat-label">{d.day}</div>
                      <div className="mini-stat-value">{d.sesiones}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* ---- Top ejercicios + recientes ---- */}
          <div className="two-col-even">
            <div className="panel">
              <div className="section-head">
                <h2 className="section-title">Ejercicios con más volumen</h2>
                <IconGrid style={{ color: "var(--text-dim)" }} />
              </div>
              {data.topExercises.map((e) => (
                <div className="row" key={e.title}>
                  <div>
                    <div className="row-title">{e.title}</div>
                    <div className="row-meta">
                      {e.muscle} · {e.sessions} sesiones
                    </div>
                  </div>
                  <span className="pill blue">{kg(e.totalVolume)} kg</span>
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="section-head">
                <h2 className="section-title">Entrenamientos recientes</h2>
                <IconLayers style={{ color: "var(--text-dim)" }} />
              </div>
              {data.recentWorkouts.length === 0 && (
                <div className="empty-state">Todavía no hay entrenamientos.</div>
              )}
              {data.recentWorkouts.map((w) => (
                <div className="row" key={w.id}>
                  <div>
                    <div className="row-title">{w.title}</div>
                    <div className="row-meta">
                      {w.date} · {w.exerciseCount} ejercicios · {w.sets} series ·{" "}
                      {w.durationMin} min
                    </div>
                  </div>
                  <span className="pill">{kg(w.volume)} kg</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="footer-note">
        Datos en vivo desde tu cuenta de Hevy · se refrescan cada 5 minutos ·
        pesos en kg
      </div>
    </div>
  );
}
