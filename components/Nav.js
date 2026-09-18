"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDumbbell } from "@/components/Icons";

export default function Nav() {
  const pathname = usePathname();
  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-mark">
          <IconDumbbell width="18" height="18" style={{ color: "#5eead4" }} />
        </span>
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
