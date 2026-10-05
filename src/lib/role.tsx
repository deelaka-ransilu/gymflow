"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "@/db/types";

type RoleCtx = {
  role: Role;
  setRole: (r: Role) => void;
  /** null = still checking the browser, true/false once known */
  signedIn: boolean | null;
  signIn: (r: Role) => void;
  signOut: () => void;
};

const RoleContext = createContext<RoleCtx>({
  role: "owner",
  setRole: () => {},
  signedIn: null,
  signIn: () => {},
  signOut: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("owner");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gf-role");
      if (saved === "owner" || saved === "receptionist") setRoleState(saved);
      setSignedIn(localStorage.getItem("gf-signed-in") === "1");
    } catch {
      setSignedIn(false);
    }
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    try {
      localStorage.setItem("gf-role", r);
    } catch {}
  };

  const signIn = (r: Role) => {
    setRole(r);
    setSignedIn(true);
    try {
      localStorage.setItem("gf-signed-in", "1");
    } catch {}
  };

  const signOut = () => {
    setSignedIn(false);
    try {
      localStorage.removeItem("gf-signed-in");
    } catch {}
  };

  return (
    <RoleContext.Provider value={{ role, setRole, signedIn, signIn, signOut }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);