// Pure functions that turn raw Hevy workouts + exercise templates into the
// shape the dashboard needs. No network calls here.
// Unidades: peso/volumen siempre en kg, distancias en cm/m, duración en minutos.

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

function estimateOneRepMax(weight, reps) {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30); // Epley
}

const MUSCLE_ES = {
  abdominals: "Abdominales",
  abductors: "Abductores",
  adductors: "Aductores",
  biceps: "Bíceps",
  calves: "Gemelos",
  cardio: "Cardio",
  chest: "Pecho",
  forearms: "Antebrazos",
  full_body: "Cuerpo completo",
  glutes: "Glúteo",
  hamstrings: "Femoral",
  lats: "Dorsales",
  lower_back: "Lumbar",
  neck: "Cuello",
  quadriceps: "Cuádriceps",
  shoulders: "Hombros",
  traps: "Trapecios",
  triceps: "Tríceps",
  upper_back: "Espalda alta",
  other: "Otros",
};

function muscleEs(key) {
  if (!key) return "Otros";
  return MUSCLE_ES[key] || key.replace(/_/g, " ");
}

export function buildDashboard(workouts, templates) {
  const templateById = new Map(templates.map((t) => [t.id, t]));

  let totalSets = 0;
  let totalReps = 0;
  let totalVolumeKg = 0;
  let totalDurationMin = 0;
  let totalDistanceM = 0;
  let totalCardioMin = 0;

  const muscleSets = new Map();
  const weekMap = new Map(); // weekISO -> { count, volume, durationMin }
  const monthMap = new Map(); // YYYY-MM -> { count, volume }
  const dayMap = new Map(); // YYYY-MM-DD -> { volume, count }
  const weekdayCount = [0, 0, 0, 0, 0, 0, 0]; // lunes..domingo
  const perExercise = new Map();
  const allWorkoutRows = [];

  const sorted = [...workouts].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );

  for (const w of sorted) {
    const start = new Date(w.start_time);
    const end = w.end_time ? new Date(w.end_time) : start;
    const durationMin = Math.max(0, (end - start) / 60000);
    totalDurationMin += durationMin;

    const dayKey = iso(start);
    const weekKey = iso(startOfWeek(start));
    const monthKey = dayKey.slice(0, 7);

    weekdayCount[(start.getDay() + 6) % 7] += 1;

    if (!weekMap.has(weekKey))
      weekMap.set(weekKey, { count: 0, volume: 0, durationMin: 0 });
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, { count: 0, volume: 0 });
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, { volume: 0, count: 0 });

    let workoutVolume = 0;
    let workoutSets = 0;

    for (const ex of w.exercises || []) {
      const template = templateById.get(ex.exercise_template_id);
      const title = template?.title || ex.title || "Ejercicio";
      const muscleKey = template?.primary_muscle_group || "other";
      const muscle = muscleEs(muscleKey);
      const equipment = template?.equipment || null;

      if (!perExercise.has(ex.exercise_template_id)) {
        perExercise.set(ex.exercise_template_id, {
          title,
          muscle,
          muscleKey,
          equipment,
          history: [],
          bestWeight: 0,
          bestOneRM: 0,
          bestVolume: 0,
          totalSets: 0,
          totalVolume: 0,
        });
      }
      const exEntry = perExercise.get(ex.exercise_template_id);

      let bestSetWeight = 0;
      let bestSetReps = 0;
      let bestOneRM = 0;
      let exVolume = 0;
      let exSets = 0;

      for (const set of ex.sets || []) {
        totalSets += 1;
        exSets += 1;
        workoutSets += 1;
        muscleSets.set(muscle, (muscleSets.get(muscle) || 0) + 1);

        const weight = set.weight_kg || 0;
        const reps = set.reps || 0;
        totalReps += reps;

        if (set.distance_meters) totalDistanceM += set.distance_meters;
        if (set.duration_seconds) totalCardioMin += set.duration_seconds / 60;

        const vol = weight * reps;
        exVolume += vol;
        workoutVolume += vol;
        totalVolumeKg += vol;

        const oneRM = estimateOneRepMax(weight, reps);
        if (oneRM > bestOneRM) {
          bestOneRM = oneRM;
          bestSetWeight = weight;
          bestSetReps = reps;
        }
      }

      exEntry.totalSets += exSets;
      exEntry.totalVolume += exVolume;

      if (exSets > 0) {
        const isPR = bestOneRM > exEntry.bestOneRM;
        exEntry.history.push({
          date: iso(start),
          topWeight: Math.round(bestSetWeight * 10) / 10,
          topReps: bestSetReps,
          estOneRM: Math.round(bestOneRM * 10) / 10,
          volume: Math.round(exVolume),
          sets: exSets,
          isPR: isPR && bestOneRM > 0,
        });
        if (bestOneRM > exEntry.bestOneRM) exEntry.bestOneRM = bestOneRM;
        if (bestSetWeight > exEntry.bestWeight) exEntry.bestWeight = bestSetWeight;
        if (exVolume > exEntry.bestVolume) exEntry.bestVolume = exVolume;
      }
    }

    const wk = weekMap.get(weekKey);
    wk.count += 1;
    wk.volume += workoutVolume;
    wk.durationMin += durationMin;

    const mo = monthMap.get(monthKey);
    mo.count += 1;
    mo.volume += workoutVolume;

    const dy = dayMap.get(dayKey);
    dy.count += 1;
    dy.volume += workoutVolume;

    allWorkoutRows.push({
      id: w.id,
      title: w.title || "Entrenamiento",
      date: dayKey,
      durationMin: Math.round(durationMin),
      exerciseCount: (w.exercises || []).length,
      sets: workoutSets,
      volume: Math.round(workoutVolume),
    });
  }

  // --- Racha semanal ---
  let weekStreak = 0;
  if (weekMap.size > 0) {
    let cursor = startOfWeek(new Date());
    if (!weekMap.has(iso(cursor))) cursor.setDate(cursor.getDate() - 7);
    while (weekMap.has(iso(cursor))) {
      weekStreak += 1;
      cursor.setDate(cursor.getDate() - 7);
    }
  }

  // --- Últimas 12 semanas ---
  const last12Weeks = [];
  let wCursor = startOfWeek(new Date());
  for (let i = 0; i < 12; i++) {
    const key = iso(wCursor);
    const entry = weekMap.get(key) || { count: 0, volume: 0 };
    last12Weeks.unshift({
      week: key,
      sesiones: entry.count,
      volumen: Math.round(entry.volume),
    });
    wCursor.setDate(wCursor.getDate() - 7);
  }

  // --- Volumen por mes (últimos 6) ---
  const monthly = [];
  const mCursor = new Date();
  mCursor.setDate(1);
  for (let i = 0; i < 6; i++) {
    const key = iso(mCursor).slice(0, 7);
    const entry = monthMap.get(key) || { count: 0, volume: 0 };
    monthly.unshift({
      month: key,
      sesiones: entry.count,
      volumen: Math.round(entry.volume),
    });
    mCursor.setMonth(mCursor.getMonth() - 1);
  }

  // --- Heatmap últimos 119 días (17 semanas) ---
  const heatmap = [];
  const hCursor = new Date();
  hCursor.setHours(0, 0, 0, 0);
  for (let i = 118; i >= 0; i--) {
    const d = new Date(hCursor);
    d.setDate(d.getDate() - i);
    const key = iso(d);
    const entry = dayMap.get(key);
    heatmap.push({
      date: key,
      volume: entry ? Math.round(entry.volume) : 0,
      trained: !!entry,
      weekday: (d.getDay() + 6) % 7,
    });
  }

  // --- Récords personales ---
  const exercises = [...perExercise.entries()].map(([id, v]) => ({
    id,
    title: v.title,
    muscle: v.muscle,
    equipment: v.equipment,
    sessions: v.history.length,
    totalSets: v.totalSets,
    totalVolume: Math.round(v.totalVolume),
    bestWeight: Math.round(v.bestWeight * 10) / 10,
    bestOneRM: Math.round(v.bestOneRM * 10) / 10,
    history: v.history,
  }));

  const personalRecords = exercises
    .filter((e) => e.bestWeight > 0)
    .map((e) => {
      const prEntry = [...e.history].reverse().find((h) => h.isPR);
      return {
        id: e.id,
        title: e.title,
        muscle: e.muscle,
        bestWeight: e.bestWeight,
        bestOneRM: e.bestOneRM,
        date: prEntry?.date || e.history[e.history.length - 1]?.date || null,
        reps: prEntry?.topReps || null,
      };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 8);

  const topExercises = [...exercises]
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 6)
    .map((e) => ({
      title: e.title,
      muscle: e.muscle,
      totalVolume: e.totalVolume,
      sessions: e.sessions,
    }));

  const muscleSplit = [...muscleSets.entries()]
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets);

  const durations = allWorkoutRows.map((w) => w.durationMin).filter((d) => d > 0);
  const avgDurationMin = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  const bestWeek = [...weekMap.entries()]
    .map(([week, v]) => ({ week, ...v, volume: Math.round(v.volume) }))
    .sort((a, b) => b.volume - a.volume)[0] || null;

  const lastWorkout = allWorkoutRows[allWorkoutRows.length - 1] || null;
  const daysSinceLast = lastWorkout
    ? Math.floor(
        (new Date().setHours(0, 0, 0, 0) - new Date(lastWorkout.date).getTime()) /
          86400000
      )
    : null;

  const weekdayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const weekdaySplit = weekdayCount.map((count, i) => ({
    day: weekdayNames[i],
    sesiones: count,
  }));

  // Volumen esta semana vs la anterior (para la flechita de tendencia)
  const thisWeekKey = iso(startOfWeek(new Date()));
  const prevWeekDate = startOfWeek(new Date());
  prevWeekDate.setDate(prevWeekDate.getDate() - 7);
  const thisWeek = weekMap.get(thisWeekKey) || { count: 0, volume: 0 };
  const prevWeek = weekMap.get(iso(prevWeekDate)) || { count: 0, volume: 0 };

  return {
    summary: {
      totalWorkouts: workouts.length,
      totalSets,
      totalReps,
      totalVolumeKg: Math.round(totalVolumeKg),
      totalDurationMin: Math.round(totalDurationMin),
      totalHours: Math.round((totalDurationMin / 60) * 10) / 10,
      totalCardioMin: Math.round(totalCardioMin),
      totalDistanceKm: Math.round((totalDistanceM / 1000) * 100) / 100,
      activeDays: dayMap.size,
      weekStreak,
      avgDurationMin,
      exerciseVariety: exercises.length,
      daysSinceLast,
      thisWeekVolume: Math.round(thisWeek.volume),
      thisWeekSessions: thisWeek.count,
      prevWeekVolume: Math.round(prevWeek.volume),
      avgVolumePerWorkout: workouts.length
        ? Math.round(totalVolumeKg / workouts.length)
        : 0,
      bestWeek,
    },
    last12Weeks,
    monthly,
    heatmap,
    muscleSplit,
    weekdaySplit,
    personalRecords,
    topExercises,
    exercises: exercises.sort((a, b) => b.sessions - a.sessions),
    recentWorkouts: allWorkoutRows.slice(-8).reverse(),
  };
}
