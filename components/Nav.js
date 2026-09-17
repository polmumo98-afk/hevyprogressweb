"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  return (
    <div className="header">
      <div className="brand">
        <span className="brand-dot" />
        Hevy Progress
      </div>
      <div className="nav">
        <Link href="/" className={pathname === "/" ? "active" : ""}>
          Dashboard
        </Link>
        <Link
          href="/exercises"
          className={pathname === "/exercises" ? "active" : ""}
        >
          Ejercicios
        </Link>
      </div>
    </div>
  );
}
