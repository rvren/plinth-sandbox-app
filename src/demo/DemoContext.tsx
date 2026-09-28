"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { UserFacts } from "@plinth/contract";

/**
 * Demo controls that a real Meridian would not have: which tenant and persona this
 * browser plays, and a clock that can jump forward a week (heatmap reports are weekly).
 * Remembered in localStorage so a reload keeps the scenario.
 */

export const TENANTS = [
  { id: "northwind", label: "Northwind Labs" },
  { id: "contoso", label: "Contoso Cloud" },
] as const;
export type TenantId = (typeof TENANTS)[number]["id"];

export const PERSONAS = [
  { id: "everyone", label: "Everyone" },
  { id: "platform", label: "Platform Engineer" },
  { id: "ml", label: "ML Engineer" },
  { id: "finops", label: "FinOps Analyst" },
] as const;
export type PersonaId = (typeof PERSONAS)[number]["id"];

/** Simulated tenure per persona; the local brain derives these from real use (Phase 3). */
const FACTS: Record<PersonaId, UserFacts> = {
  everyone: UserFacts.parse({ sessionCount: 8, daysSinceFirstSeen: 30, usedCapabilities: [], touchedKeys: [] }),
  platform: UserFacts.parse({ persona: "platform", sessionCount: 12, daysSinceFirstSeen: 40, usedCapabilities: ["cluster.health", "alerts.list"], touchedKeys: [] }),
  ml: UserFacts.parse({ persona: "ml", sessionCount: 6, daysSinceFirstSeen: 18, usedCapabilities: ["training.runs", "queue.status"], touchedKeys: [] }),
  finops: UserFacts.parse({ persona: "finops", sessionCount: 21, daysSinceFirstSeen: 96, usedCapabilities: ["spend.summary", "reports.saved"], touchedKeys: [] }),
};

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked */
  }
};

type Demo = {
  tenant: (typeof TENANTS)[number];
  setTenant: (id: TenantId) => void;
  persona: PersonaId;
  setPersona: (id: PersonaId) => void;
  facts: UserFacts;
  /** Days added to the heatmap collector's clock. */
  clockOffsetDays: number;
  fastForward: (days: number) => void;
  collectorClock: () => Date;
};

const DemoContext = createContext<Demo | null>(null);

export const useDemo = (): Demo => {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo outside DemoProvider");
  return value;
};

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [tenantId, setTenantId] = useState<TenantId>(() => (read("meridian.demo.tenant") === "contoso" ? "contoso" : "northwind"));
  const [persona, setPersonaState] = useState<PersonaId>(() => {
    const stored = read("meridian.demo.persona");
    return PERSONAS.some((p) => p.id === stored) ? (stored as PersonaId) : "everyone";
  });
  const [offset, setOffset] = useState(() => Number(read("meridian.demo.clockOffsetDays")) || 0);

  const setTenant = useCallback((id: TenantId) => {
    write("meridian.demo.tenant", id);
    setTenantId(id);
  }, []);
  const setPersona = useCallback((id: PersonaId) => {
    write("meridian.demo.persona", id);
    setPersonaState(id);
  }, []);
  const fastForward = useCallback((days: number) => {
    setOffset((previous) => {
      const next = previous + days;
      write("meridian.demo.clockOffsetDays", String(next));
      return next;
    });
  }, []);
  const collectorClock = useCallback(() => new Date(Date.now() + offset * 86_400_000), [offset]);

  const value = useMemo<Demo>(
    () => ({
      tenant: TENANTS.find((t) => t.id === tenantId) ?? TENANTS[0],
      setTenant,
      persona,
      setPersona,
      facts: FACTS[persona],
      clockOffsetDays: offset,
      fastForward,
      collectorClock,
    }),
    [tenantId, setTenant, persona, setPersona, offset, fastForward, collectorClock],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};
