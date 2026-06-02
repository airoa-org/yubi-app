"use client";

import { createContext, useContext } from "react";

import type { UserSession } from "./session";

interface SessionContextValue {
  userSession: UserSession | null;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

interface SessionProviderProps {
  userSession: UserSession | null;
  children: React.ReactNode;
}

export function SessionProvider({
  userSession,
  children,
}: SessionProviderProps) {
  return (
    <SessionContext.Provider value={{ userSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
