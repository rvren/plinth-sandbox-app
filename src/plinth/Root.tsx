"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PlinthProvider } from "@plinth/sdk-react";
import { meridianCatalog } from "../catalog/specs";
import { meridianData } from "../platform/data";
import { DemoProvider, useDemo } from "../demo/DemoContext";
import { Inspector } from "../demo/Inspector";
import { Sidebar } from "../design-system/Sidebar";
import { PINNED_KEYS } from "./keys";
import { meridianComponents } from "./registry";
import { createTransport } from "./transport";

/**
 * Meridian's app shell, wrapped in plinth. This file and ./registry.tsx are what the setup
 * pull request adds; the rest of Meridian is untouched.
 *
 * Screens are route PATTERNS. Meridian's routes are static, so the pathname is the pattern;
 * a dynamic route would map "/clusters/7" to "/clusters/:id" here, before anything is seen
 * by the SDK.
 */

const PATTERNS = new Set(["/"]);
const toPattern = (pathname: string): string => (PATTERNS.has(pathname) ? pathname : "(other)");

const Wired = ({ children }: { children: ReactNode }) => {
  const demo = useDemo();
  const pathname = usePathname() ?? "/";
  // Each demo persona is a synthetic user of the tenant, so a personalized tenant gives each its own page.
  const transport = useMemo(() => createTransport(demo.tenant.id, `${demo.persona}@meridian.example`), [demo.tenant.id, demo.persona]);
  const data = useMemo(() => ({ ...meridianData, org: { ...meridianData.org, name: demo.tenant.label } }), [demo.tenant.label]);

  return (
    <PlinthProvider
      transport={transport}
      pinnedKeys={PINNED_KEYS}
      screen={toPattern(pathname)}
      items={meridianCatalog}
      components={meridianComponents}
      data={data}
      facts={demo.facts}
      storageKey={`${demo.tenant.id}.${demo.persona}`}
      collectorClock={demo.collectorClock}
      // No fast polling: a console change is pushed (liveUpdates, on by default) and lands
      // on the next navigation.
      // The vendor's brand (Brand page in the console), mapped onto Meridian's own tokens.
      // Meridian ships one dark theme, so it always takes the dark palette.
      colorScheme="dark"
      themeVariables={{
        primary: "--color-accent",
        background: "--color-bg",
        surface: "--color-surface",
        text: "--color-text",
        textMuted: "--color-text-muted",
        border: "--color-border",
        positive: "--color-positive",
        warning: "--color-warning",
        critical: "--color-critical",
        radius: "--radius-md",
      }}
      onCapability={(action) => console.info("[meridian] capability invoked", action.capability)}
      onDegraded={(surface, errors) => console.error("[meridian] region degraded", surface, errors)}
    >
      <Sidebar />
      <main style={{ minWidth: 0, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "var(--space-4)" }}>{children}</main>
      <Inspector />
    </PlinthProvider>
  );
};

const Root = ({ children }: { children: ReactNode }) => (
  <DemoProvider>
    <Wired>{children}</Wired>
  </DemoProvider>
);

export default Root;
