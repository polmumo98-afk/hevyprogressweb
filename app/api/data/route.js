import { NextResponse } from "next/server";
import { fetchAllWorkouts, fetchAllExerciseTemplates } from "@/lib/hevy";
import { buildDashboard } from "@/lib/aggregate";

export const dynamic = "force-dynamic"; // nunca prerenderizar en build, siempre en cada request
export const revalidate = 300; // 5 minutos de caché de datos (vía fetch cache)

export async function GET() {
  try {
    const [workouts, templates] = await Promise.all([
      fetchAllWorkouts(),
      fetchAllExerciseTemplates(),
    ]);
    const dashboard = buildDashboard(workouts, templates);
    return NextResponse.json(dashboard);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
