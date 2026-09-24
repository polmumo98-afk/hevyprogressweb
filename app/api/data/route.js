import { NextResponse } from "next/server";
import { fetchAllWorkouts, fetchAllExerciseTemplates } from "@/lib/hevy";
import { buildDashboard } from "@/lib/aggregate";

export const dynamic = "force-dynamic"; // nunca prerenderizar en build, siempre en cada request
export const revalidate = 300; // 5 minutos de caché de datos (vía fetch cache)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "all"; // "30" | "90" | "365" | "all"

    const [workouts, templates] = await Promise.all([
      fetchAllWorkouts(),
      fetchAllExerciseTemplates(),
    ]);

    let filtered = workouts;
    if (range === "week") {
      // desde el lunes de esta semana a las 00:00
      const now = new Date();
      const day = (now.getDay() + 6) % 7; // lunes = 0
      const monday = new Date(now);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() - day);
      const cutoff = monday.getTime();
      filtered = workouts.filter(
        (w) => new Date(w.start_time).getTime() >= cutoff
      );
    } else if (range !== "all") {
      const days = parseInt(range, 10);
      if (!Number.isNaN(days) && days > 0) {
        const cutoff = Date.now() - days * 86400000;
        filtered = workouts.filter(
          (w) => new Date(w.start_time).getTime() >= cutoff
        );
      }
    }

    const dashboard = buildDashboard(filtered, templates);
    return NextResponse.json(dashboard);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
