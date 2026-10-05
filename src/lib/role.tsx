"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "@/db/types";

const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: "owner",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("owner");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gf-role");
      if (saved === "owner" || saved === "receptionist") setRoleState(saved);
    } catch {}
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    try {
      localStorage.setItem("gf-role", r);
    } catch {}
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);