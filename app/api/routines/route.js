import { NextResponse } from "next/server";
import {
  fetchAllRoutines,
  fetchAllRoutineFolders,
  fetchAllExerciseTemplates,
} from "@/lib/hevy";

export const dynamic = "force-dynamic";
export const revalidate = 300;

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
};

function repRange(sets) {
  const reps = sets.map((s) => s.reps).filter((r) => r != null && r > 0);
  if (reps.length === 0) return null;
  const min = Math.min(...reps);
  const max = Math.max(...reps);
  return min === max ? `${min}` : `${min}-${max}`;
}

function fmtRest(seconds) {
  if (!seconds) return null;
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem ? `${min}min ${rem}s` : `${min} min`;
}

export async function GET() {
  try {
    const [routines, folders, templates] = await Promise.all([
      fetchAllRoutines(),
      fetchAllRoutineFolders().catch(() => []),
      fetchAllExerciseTemplates(),
    ]);

    const templateById = new Map(templates.map((t) => [t.id, t]));
    const folderById = new Map(folders.map((f) => [f.id, f.title]));

    const normalized = routines.map((r) => {
      const exercises = (r.exercises || []).map((ex) => {
        const template = templateById.get(ex.exercise_template_id);
        const muscleKey = template?.primary_muscle_group;
        const sets = ex.sets || [];
        // detecta si es cardio (solo duración/distancia, sin reps)
        const isCardio = sets.every((s) => !s.reps && (s.duration_seconds || s.distance_meters));
        let setsLabel;
        if (isCardio) {
          const dur = sets.find((s) => s.duration_seconds)?.duration_seconds;
          setsLabel = dur ? `${Math.round(dur / 60)} min` : `${sets.length} series`;
        } else {
          const range = repRange(sets);
          setsLabel = range ? `${sets.length} × ${range}` : `${sets.length} series`;
        }
        return {
          title: template?.title || ex.title || "Ejercicio",
          muscle: muscleKey ? MUSCLE_ES[muscleKey] || muscleKey : null,
          setsLabel,
          setCount: sets.length,
          rest: fmtRest(ex.rest_seconds),
          supersetId: ex.superset_id ?? null,
          notes: ex.notes || null,
        };
      });

      const totalSets = exercises.reduce((a, e) => a + e.setCount, 0);

      return {
        id: r.id,
        title: r.title || "Rutina",
        folder: r.folder_id != null ? folderById.get(r.folder_id) || null : null,
        notes: r.notes || null,
        exerciseCount: exercises.length,
        totalSets,
        exercises,
        updatedAt: r.updated_at || null,
      };
    });

    // ordenar: por carpeta y luego por título
    normalized.sort((a, b) => {
      const fa = a.folder || "";
      const fb = b.folder || "";
      if (fa !== fb) return fa.localeCompare(fb);
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json({ routines: normalized });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
