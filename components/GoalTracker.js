"use client";

import { useEffect, useState } from "react";

const KEY = "hevy-progress-goals";

function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function saveGoals(goals) {
  try {
    localStorage.setItem(KEY, JSON.stringify(goals));
  } catch {
    // sin localStorage (modo privado): el objetivo no persiste, pero no rompe
  }
}

export default function GoalTracker({ exercise }) {
  const [goals, setGoals] = useState({});
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  useEffect(() => {
    setEditing(false);
    setDraft("");
  }, [exercise.id]);

  const goal = goals[exercise.id];
  const current = exercise.bestOneRM || 0;
  const pct = goal ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const reached = goal && current >= goal;

  const commit = () => {
    const val = parseFloat(draft.replace(",", "."));
    const next = { ...goals };
    if (!val || val <= 0) {
      delete next[exercise.id];
    } else {
      next[exercise.id] = val;
    }
    setGoals(next);
    saveGoals(next);
    setEditing(false);
    setDraft("");
  };

  const remove = () => {
    const next = { ...goals };
    delete next[exercise.id];
    setGoals(next);
    saveGoals(next);
  };

  return (
    <div className="goal-box">
      <div className="goal-head">
        <span className="mini-stat-label">Objetivo (1RM)</span>
        {goal && !editing && (
          <button
            className="goal-link"
            onClick={() => {
              setDraft(String(goal));
              setEditing(true);
            }}
          >
            editar
          </button>
        )}
      </div>

      {!goal && !editing && (
        <button className="goal-set-btn" onClick={() => setEditing(true)}>
          + Fijar un objetivo
        </button>
      )}

      {editing && (
        <div className="goal-edit">
          <input
            type="number"
            inputMode="decimal"
            placeholder="kg"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            autoFocus
            style={{ width: 90 }}
          />
          <button className="goal-save" onClick={commit}>
            Guardar
          </button>
          {goal && (
            <button className="goal-link" onClick={remove}>
              quitar
            </button>
          )}
        </div>
      )}

      {goal && !editing && (
        <>
          <div className="goal-values">
            <span className="goal-current">{current} kg</span>
            <span className="goal-target">/ {goal} kg</span>
            {reached && <span className="pill gold">¡Conseguido! 🎉</span>}
          </div>
          <div className="goal-track">
            <div
              className={`goal-fill ${reached ? "done" : ""}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="goal-pct">
            {reached
              ? "Has superado tu objetivo"
              : `${pct}% · te faltan ${Math.round((goal - current) * 10) / 10} kg`}
          </div>
        </>
      )}
    </div>
  );
}
