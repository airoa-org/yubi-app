"use client";

import { createContext, useContext } from "react";

import type { RobotStatusMap } from "../hooks/use-robots-status-stream";

interface RobotsStatusContextValue {
  statusMap: RobotStatusMap;
  isConnected: boolean;
}

const RobotsStatusContext = createContext<RobotsStatusContextValue | undefined>(
  undefined
);

interface RobotsStatusProviderProps {
  statusMap: RobotStatusMap;
  isConnected: boolean;
  children: React.ReactNode;
}

export function RobotsStatusProvider({
  statusMap,
  isConnected,
  children,
}: RobotsStatusProviderProps) {
  return (
    <RobotsStatusContext.Provider value={{ statusMap, isConnected }}>
      {children}
    </RobotsStatusContext.Provider>
  );
}

export function useRobotsStatus(): RobotsStatusContextValue {
  const context = useContext(RobotsStatusContext);

  if (context === undefined) {
    throw new Error(
      "useRobotsStatus must be used within a RobotsStatusProvider"
    );
  }

  return context;
}
