"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // silencioso: si falla el SW, la web sigue funcionando normal
      });
    }
  }, []);
  return null;
}
