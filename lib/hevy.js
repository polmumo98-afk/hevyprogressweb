// Server-side helper to talk to the Hevy public API.
// The API key NEVER reaches the browser: it's read from an env var here
// and only used inside API routes / server components.

const API_BASE = "https://api.hevyapp.com/v1";

function getApiKey() {
  const key = process.env.HEVY_API_KEY;
  if (!key) {
    throw new Error(
      "Falta la variable de entorno HEVY_API_KEY. Configúrala en Vercel (Settings > Environment Variables)."
    );
  }
  return key;
}

async function hevyFetch(path, params = {}) {
  const apiKey = getApiKey();
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { "api-key": apiKey },
    // cache aggregated data for 5 minutes to avoid hammering the API
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Hevy API ${path} -> HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function fetchAllWorkouts() {
  const workouts = [];
  let page = 1;
  const pageSize = 10;
  // Hevy paginates workouts; keep pulling until we run out of pages.
  // Hard cap to avoid runaway loops if the API ever misbehaves.
  for (let i = 0; i < 500; i++) {
    const data = await hevyFetch("/workouts", { page, pageSize });
    const batch = data.workouts || [];
    workouts.push(...batch);
    const pageCount = data.page_count || 1;
    if (page >= pageCount || batch.length === 0) break;
    page += 1;
  }
  return workouts;
}

export async function fetchAllExerciseTemplates() {
  const templates = [];
  let page = 1;
  const pageSize = 100;
  for (let i = 0; i < 50; i++) {
    const data = await hevyFetch("/exercise_templates", { page, pageSize });
    const batch = data.exercise_templates || [];
    templates.push(...batch);
    if (batch.length < pageSize) break;
    page += 1;
  }
  return templates;
}
