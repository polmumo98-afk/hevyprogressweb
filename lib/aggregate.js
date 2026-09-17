// Pure functions that turn raw Hevy workouts + exercise templates into the
// shape the dashboard needs. No network calls here.

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function fmtWeek(d) {
  return d.toISOString().slice(0, 10);
}

function estimateOneRepMax(weight, reps) {
  if (!weight || !reps) return 0;
  // Epley formula
  return weight * (1 + reps / 30);
}

export function buildDashboard(workouts, templates) {
  const templateById = new Map(templates.map((t) => [t.id, t]));

  let totalSets = 0;
  let totalVolumeKg = 0;
  let totalDurationMin = 0;
  const muscleSets = new Map(); // muscle -> set count
  const weekMap = new Map(); // weekStartISO -> { count, volume }
  const dayWorkedSet = new Set(); // YYYY-MM-DD with at least one workout
  const perExercise = new Map(); // template_id -> { title, history: [] }
  const recentWorkouts = [];

  const sorted = [...workouts].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );

  for (const w of sorted) {
    const start = new Date(w.start_time);
    const end = w.end_time ? new Date(w.end_time) : start;
    const durationMin = Math.max(0, (end - start) / 60000);
    totalDurationMin += durationMin;
    dayWorkedSet.add(start.toISOString().slice(0, 10));

    const weekKey = fmtWeek(startOfWeek(start));
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, { count: 0, volume: 0 });
    const wk = weekMap.get(weekKey);
    wk.count += 1;

    let workoutVolume = 0;

    for (const ex of w.exercises || []) {
      const template = templateById.get(ex.exercise_template_id);
      const title = template?.title || ex.title || "Ejercicio";
      const muscle = template?.primary_muscle_group || "Otro";

      if (!perExercise.has(ex.exercise_template_id)) {
        perExercise.set(ex.exercise_template_id, { title, muscle, history: [] });
      }
      const exEntry = perExercise.get(ex.exercise_template_id);

      let bestSetWeight = 0;
      let bestSetReps = 0;
      let bestOneRM = 0;
      let exVolume = 0;

      for (const set of ex.sets || []) {
        totalSets += 1;
        muscleSets.set(muscle, (muscleSets.get(muscle) || 0) + 1);

        const weight = set.weight_kg || 0;
        const reps = set.reps || 0;
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

      if ((ex.sets || []).length > 0) {
        exEntry.history.push({
          date: start.toISOString().slice(0, 10),
          topWeight: bestSetWeight,
          topReps: bestSetReps,
          estOneRM: Math.round(bestOneRM * 10) / 10,
          volume: Math.round(exVolume),
        });
      }
    }

    wk.volume += workoutVolume;

    recentWorkouts.push({
      id: w.id,
      title: w.title || "Entrenamiento",
      date: start.toISOString().slice(0, 10),
      durationMin: Math.round(durationMin),
      exerciseCount: (w.exercises || []).length,
      volume: Math.round(workoutVolume),
    });
  }

  // Streak: consecutive days-worked window counting back from today,
  // but training isn't daily, so we compute the current "active week streak"
  // (consecutive weeks with >=1 workout) which is more meaningful for a
  // 4-day/week program.
  const weekKeys = [...weekMap.keys()].sort();
  let weekStreak = 0;
  if (weekKeys.length > 0) {
    const thisWeekKey = fmtWeek(startOfWeek(new Date()));
    let cursor = new Date(thisWeekKey);
    // if this week has no workout yet, start counting from last week
    if (!weekMap.has(fmtWeek(cursor))) {
      cursor.setDate(cursor.getDate() - 7);
    }
    while (weekMap.has(fmtWeek(cursor))) {
      weekStreak += 1;
      cursor.setDate(cursor.getDate() - 7);
    }
  }

  const last12Weeks = [];
  let cursor = startOfWeek(new Date());
  for (let i = 0; i < 12; i++) {
    const key = fmtWeek(cursor);
    const entry = weekMap.get(key) || { count: 0, volume: 0 };
    last12Weeks.unshift({
      week: key,
      sesiones: entry.count,
      volumen: Math.round(entry.volume),
    });
    cursor.setDate(cursor.getDate() - 7);
  }

  const muscleSplit = [...muscleSets.entries()]
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets);

  const exercises = [...perExercise.entries()]
    .map(([id, v]) => ({
      id,
      title: v.title,
      muscle: v.muscle,
      sessions: v.history.length,
      history: v.history,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  return {
    summary: {
      totalWorkouts: workouts.length,
      totalSets,
      totalVolumeKg: Math.round(totalVolumeKg),
      totalDurationMin: Math.round(totalDurationMin),
      activeDays: dayWorkedSet.size,
      weekStreak,
    },
    last12Weeks,
    muscleSplit,
    exercises,
    recentWorkouts: recentWorkouts.slice(-10).reverse(),
  };
}
